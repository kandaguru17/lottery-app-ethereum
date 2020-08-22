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
    return state.players.map((it) => (
      <li>
        <em>{it}</em>
      </li>
    ));
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

  const renderMessage = () => {
    const className = 'alert alert-info alert-dismissible';
    return state.message === '' ? (
      ''
    ) : (
      <div className={`${className} p-3 mt-3`} role='alert'>
        {state.message}
        <button
          type='button'
          className='close'
          data-dismiss='alert'
          aria-label='Close'
          onClick={() => {
            setstate((prevState) => ({ ...prevState, message: '' }));
          }}
        >
          <span aria-hidden='true'>&times;</span>
        </button>
      </div>
    );
  };

  return (
    <>
      <div className='container'>
        <h1 className='text-center pb-5'>LOTTERY CONTRACT</h1>
        <h3 className='text-center pb-5'>
          CONTRACT MANAGED BY : <em>{state.manager}</em>
        </h3>

        <div className='row offset-1'>
          <div className='col-6'>
            <h3 className='pb-3'>
              Number of players participating : {state.players.length}{' '}
            </h3>
            <h3>Players in the lottery:</h3>
            <ul>{renderPlayers()}</ul>
          </div>

          <div className='col-6'>
            <h3 className='pb-3'>
              Money in the Wallet:{' '}
              {` ${web3.utils.fromWei(state.balance, 'ether')} Ether`}
            </h3>
            <form onSubmit={enrollPlayer}>
              <h3>Try your Luck Yo!</h3>
              <div className='form-group row mx-auto '>
                <input
                  type='number'
                  name='value'
                  placeholder='Amount in Ethers'
                  value={state.value}
                  onChange={(e) => onInputChange(e)}
                  className=' col-6 form-control mr-2'
                />
                <button type='submit' className='btn btn-primary'>
                  Enter
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className='col-12 text-center pt-5'>
          <h3>Pick a random Winner</h3>
          <button
            className='btn btn-success'
            type='button'
            onClick={chooseWinner}
          >
            Choose
          </button>
        </div>

        {renderMessage()}
      </div>
    </>
  );
}

export default App;
