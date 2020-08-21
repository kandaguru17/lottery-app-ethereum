import React, { useEffect, useState } from 'react';
import './App.css';
import lottery from './lottery';
import web3 from './web3';

export interface ILotteryContract {
  manager: string;
  players: string[];
  balance: string;
  value: string;
  message: string;
}

const intialState: ILotteryContract = {
  manager: '',
  players: [],
  balance: '',
  value: '',
  message: '',
};

const WAIT_MESSAGE = 'Please wait for transaction to complete...';
const SUCCESS_ENROL_MESSAGE = 'You are successfully enrolled';
const WINNER_MESSAGE =
  'winner is Chosen! please check your metamask account to see if your are LUCKY!!';

function App() {
  const [state, setstate] = useState(intialState);

  useEffect(() => {
    const getManager = async () => {
      const manager = await lottery.methods.manager().call();
      const players = await lottery.methods.getPlayers().call();
      const balance = await web3.eth.getBalance(lottery.options.address);
      const currentPlayer = players[0];
      setstate((prevState) => ({
        ...prevState,
        manager,
        players,
        balance,
        currentPlayer,
      }));
    };
    getManager();
  }, [state.message]);

  const renderPlayers = () => {
    return state.players.map((it) => <li>{it}</li>);
  };

  const onInputChange = (e: any) => {
    e.persist();
    setstate((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const enrollPlayer = async (e: any) => {
    e.preventDefault();
    const accounts = await web3.eth.getAccounts();
    setstate((prevState) => ({ ...prevState, message: WAIT_MESSAGE }));
    try {
      await lottery.methods.enroll().send({
        from: accounts[0],
        value: web3.utils.toWei(state.value, 'ether'),
      });
      setstate((prevState) => ({
        ...prevState,
        message: SUCCESS_ENROL_MESSAGE,
      }));
    } catch (err) {
      setstate((prevState) => ({ ...prevState, message: err.message }));
      console.log(err);
    }
  };

  const chooseWinner = async () => {
    const accounts = await web3.eth.getAccounts();
    setstate((prevState) => ({ ...prevState, message: WAIT_MESSAGE }));
    try {
      const res = await lottery.methods
        .chooseWinner()
        .send({ from: accounts[0] });
      console.log(res);
      setstate((prevState) => ({
        ...prevState,
        message: WINNER_MESSAGE,
      }));
    } catch (err) {
      setstate((prevState) => ({ ...prevState, message: err.message }));
      console.log(err);
    }
  };

  return (
    <>
      <div className='App'>
        <h1>Lottery Contract</h1>
        <h3>Contract is managed by : {state.manager} </h3>
        <h3>Number of players participating : {state.players.length} </h3>
        <h3>Players in the lottery:</h3>
        <ul>{renderPlayers()}</ul>

        <h3>Money in the Wallet:</h3>
        <h2>{web3.utils.fromWei(state.balance, 'ether')} Ether</h2>

        <hr />

        <form onSubmit={enrollPlayer}>
          <h3>Try your Luck Yo!</h3>
          <input
            type='number'
            name='value'
            value={state.value}
            onChange={(e) => onInputChange(e)}
          />
          <button type='submit'>Enter</button>
        </form>

        <hr />

        <>
          <h3>Pick a random Winner</h3>
          <button type='button' onClick={chooseWinner}>
            Choose
          </button>
        </>

        <hr />

        <h2>{state.message}</h2>
      </div>
    </>
  );
}

export default App;
