import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'

import './App.css'
import _ from 'lodash'

const socket = io.connect('https://pokemon-trumps.herokuapp.com/')

function App() {
  const [showMyPokemon, setShowMyPokemon] = useState(false)
  const [showBattle, setShowBattle] = useState(false)
  const [playerOneCard, setPlayerOneCard] = useState({name: 'PokemonCardRear', points: 0})
  const [playerTwoCard, setPlayerTwoCard] = useState({name: 'PokemonCardRear', points: 0})
  const [cardsSet, setCardsSet] = useState([])
  const [cardNum, setCardNum] = useState(0)
  const [playerTwoWins, setPlayerTwoWins] = useState(0)
  const [playerOneWins, setPlayerOneWins] = useState(0)
  const [winnerText, setWinnerText] = useState('')
  const [roundNum, setRoundNum] = useState(0)
  const [pokeBallVisible, setPokeBallVisible] = useState('block')
  const [players, setPlayers] = useState([{players: [{name: '', id: ''}, {name: '', id: ''}]}])
  const [hasTwoPlayers, setHasTwoPlayers] = useState(false)

  const throwPokeBall = e => {
    const {name, points} = possiblePokemon[Math.floor(Math.random() * possiblePokemon.length)]
    setPokeBallVisible('none')
    socket.emit('pokemonCard', {name, points})
  }

  const nextUp = e => {
    setTimeout(() => {
      socket.emit('refreshPage')
    }, 500)
  }

  useEffect(() => {
    socket.on('refreshPage', () => {
      setRoundNum(roundNum + 1)
    })
    return () => {
      socket.off('refreshPage')
    }
  })

  useEffect(() => {
    socket.emit('getPlayers', {})
  }, [])

  useEffect(() => {
    socket.on('newPlayerAdded', data => {
      if(data.players.length > 1) {
        setHasTwoPlayers(true)
      } else {
        setHasTwoPlayers(false)
        setShowBattle(false)
      }
      setPlayers([data])
    })
    return () => {
      socket.off('newPlayerAdded')
    }
  }, [players])

  useEffect(() => {
    setPlayerOneCard({name: 'PokemonCardRear', points: 0})
    setPlayerTwoCard({name: 'PokemonCardRear', points: 0})
    setPokeBallVisible('block')
  }, [roundNum])

  useEffect(() => {
    socket.on('pokemonCard', ({name, points}) => {
      if(name !== undefined) {
        setCardsSet([...cardsSet, {name, points}])
      }  
    })
    return () => {
      socket.off('pokemonCard')
    }
  })

  useEffect(() => {
    if(playerOneCard.points === playerTwoCard.points) {
      setWinnerText(`IT'S A DRAW!`)
    } else if(playerOneCard.points > playerTwoCard.points) {
      setWinnerText('PLAYER ONE WINS!')
      setPlayerOneWins(playerOneWins + 1)
    } else if(playerOneCard.points < playerTwoCard.points) {
      setWinnerText('PLAYER TWO WINS!')
      setPlayerTwoWins(playerTwoWins + 1)
    } // eslint-disable-next-line 
  }, [playerTwoCard.points])

  useEffect(() => {
    if(cardsSet.length > 0) {
      if(playerOneCard.name === 'PokemonCardRear') {
        setPlayerOneCard({name: cardsSet[cardNum].name, points: cardsSet[cardNum].points})
      } else if(cardsSet.length > (cardNum + 1) && playerTwoCard.name === 'PokemonCardRear') {
        setPlayerTwoCard({name: cardsSet[cardNum + 1].name, points: cardsSet[cardNum + 1].points})
        setCardNum(cardNum + 2)
      }
    } // eslint-disable-next-line 
  }, [cardsSet])

  const myPokemon = [
    {name: 'Charmander'}, 
    {name: 'Charmeleon'}, 
    {name: 'Charizard'}, 
    {name: 'Mega Charizard'},
    {name: 'Mewtwo'},
    {name: 'Pichu'}
  ]

  const possiblePokemon = [
    {name: 'Bulbasaur', points: 50},
    {name: 'Ivysaur', points: 100},
    {name: 'Venusaur', points: 160},
    {name: 'Charmander', points: 70},
    {name: 'Charmeleon', points: 100},
    {name: 'Charizard', points: 180},
    {name: 'Mewtwo', points: 190},
    {name: 'Pichu', points: 40},
    {name: 'Eevee', points: 50},
    {name: 'Mew', points: 60},
    {name: 'Pikachu', points: 70},
    {name: 'Snorlax', points: 150},
    {name: 'Squirtle', points: 50},
    {name: 'Oshawott', points: 60},
    {name: 'Meowth', points: 60}
  ]

  return (
    <div>
      {!showBattle && <img className='logo' alt='Logo' src={require('./images/pokemonLogo.png')} />}
      {(!showBattle && !showMyPokemon) ?
        <div className='myPokemon'>
          <h3>WELCOME TRAINER!</h3>
          <button style={{ display: 'none' }} onClick={e => (setShowMyPokemon(true))}>MY FAVOURITE POKEMON</button>
          {!hasTwoPlayers && <h4>WAITING ON ANOTHER PLAYER...</h4>}
          {hasTwoPlayers && <button onClick={e => {setShowBattle(true)}}><img alt='PokeBall' src={require('./images/pokeBall.png')} />BATTLE<img alt='GreatBall' src={require('./images/greatBall.png')} /></button>}
        </div> : <div></div>
      }
      {showMyPokemon &&
        <div>
          <button onClick={e => (setShowMyPokemon(false))}>BACK</button>
          <div className='myPokemonCollection'>
            {myPokemon && _.map(myPokemon, (pokemon) => 
              <div key={pokemon.name}>
                <img alt={pokemon.name} src={require(`./images/pokemon/${pokemon.name}.png`)} />
                {pokemon.name.toUpperCase()}
              </div>
            )}
          </div>
        </div>
      }
      {showBattle &&
        <div className='battleArea'>
          <img className='logoSmall' alt='Logo' src={require('./images/pokemonLogo.png')} />
          {(socket.id === (players[0].players[0].id)) ? <p className='youArePlayer'>YOU ARE PLAYER ONE</p> : <p></p>}
          {(socket.id === (players[0].players[1].id)) ? <p className='youArePlayer'>YOU ARE PLAYER TWO</p> : <p></p>}
          <div className='pokeCardsGrid'>
            <p>PLAYER ONE</p>
            <p>PLAYER TWO</p>
            <p>WINS: {playerOneWins}</p>
            <p>WINS: {playerTwoWins}</p>
            <img alt='Card' src={require(`./images/pokemonCards/${playerOneCard.name}.png`)} />
            <img alt='Card' src={require(`./images/pokemonCards/${playerTwoCard.name}.png`)} />
            <p>{playerOneCard.points}</p>
            <p>{playerTwoCard.points}</p>
          </div>
          {(playerTwoCard.points > 0) ? <p className='winnerText'>{winnerText}</p> : <p></p>}
          {(playerOneCard.name === 'PokemonCardRear' && socket.id === (players[0].players[0].id)) ? <div className='pokeBallPicker'>
            <img style={{ display: `${pokeBallVisible}` }} onClick={throwPokeBall} alt='PokeBall' src={require('./images/pokeBall.png')} />
            <img style={{ display: `${pokeBallVisible}` }} onClick={throwPokeBall} alt='PokeBall' src={require('./images/pokeBall.png')} />
            <img style={{ display: `${pokeBallVisible}` }} onClick={throwPokeBall} alt='PokeBall' src={require('./images/pokeBall.png')} />
          </div> : (playerOneCard.name !== 'PokemonCardRear' && socket.id === (players[0].players[1].id)) ? <div className='pokeBallPicker'>
            <img style={{ display: `${pokeBallVisible}` }} onClick={throwPokeBall} alt='PokeBall' src={require('./images/pokeBall.png')} />
            <img style={{ display: `${pokeBallVisible}` }} onClick={throwPokeBall} alt='PokeBall' src={require('./images/pokeBall.png')} />
            <img style={{ display: `${pokeBallVisible}` }} onClick={throwPokeBall} alt='PokeBall' src={require('./images/pokeBall.png')} />
          </div> : (playerTwoCard.name !== 'PokemonCardRear') ? <div>{(socket.id === (players[0].players[0].id)) && <button onClick={e => (nextUp())}>NEXT</button>}</div> : <div></div>}
        </div>
      }
    </div>
  )
}

export default App