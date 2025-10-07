import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
	const ballRadius = 10;
	const initialBallState = { x: 289, y: 190, speedX: 4, speedY: 4 };
	const initialPaddleState = { left: 150, right: 150 };
	const initialScore = { left: 0, right: 0 };
	const [ball, setBall] = useState(initialBallState);
	const [paddles, setPaddles] = useState(initialPaddleState);
	const [score, setScore] = useState(initialScore);
	const [gameOver, setGameOver] = useState(false);
	const [gameRunning, setGameRunning] = useState(false);
	const [gameMode, setGameMode] = useState('human');
	const [popupMessage, setPopupMessage] = useState('');
	const [popupVisible, setPopupVisible] = useState(false);
	const [winnerPopup, setWinnerPopup] = useState('');
	const [winnerPopupVisible, setWinnerPopupVisible] = useState(false);

	const containerHeight = 390;
	const containerWidth = 588;
	const paddleHeight = 90;
	const paddleWidth = 14;
	const moveSpeed = 20;
	const fastMoveSpeed = 30;

	const intervalRef = useRef(null);
  	const paddlesRef = useRef(initialPaddleState);
	const moveIntervalRef = useRef({ left: null, right: null });
	const keyPressedRef = useRef({ left: false, right: false });
	const collisionCountRef = useRef(0);
	const cpuIntervalRef = useRef(null);

	const checkWinner = () => {
		if (
			(score.left >= 9 && score.left - score.right >= 2) ||
			(score.right >= 9 && score.right - score.left >= 2)
		) {
			setWinnerPopup(
				score.left >= 9 && score.left - score.right >= 2
				? 'Player 1 wins!'
				: 'Player 2 wins!'
			);
			setWinnerPopupVisible(true);
			setGameRunning(false);
			clearInterval(intervalRef.current);
			clearInterval(cpuIntervalRef.current);
		}
	};

	const updateBallPosition = () => {
		if (!gameRunning) return;

		setBall((prevBall) => {
			let updateBall = { ...prevBall };
			updateBall.x += updateBall.speedX;
			updateBall.y += updateBall.speedY;

			const ballLeft = updateBall.x - ballRadius;
			const ballRight = updateBall.x + ballRadius;
			const ballTop = updateBall.y - ballRadius;
			const ballBottom = updateBall.y + ballRadius;

			const paddleLeftTop = paddlesRef.current.left;
			const paddleLeftBottom = paddlesRef.current.left + paddleHeight;
			const paddleRightTop = paddlesRef.current.right;
			const paddleRightBottom = paddlesRef.current.right + paddleHeight;

			let paddleHit = false;

			if (ballLeft <= paddleWidth &&
				ballTop < paddleLeftBottom &&
				ballBottom > paddleLeftTop) {
				
				if (ballTop > paddleLeftTop && ballBottom < paddleLeftBottom) {
					updateBall.speedX = -updateBall.speedX;
					updateBall.speedY += Math.random() * 2 - 1;
				}
				else if (ballTop <= paddleLeftTop + ballRadius || ballBottom >= paddleLeftBottom - ballRadius) {
					updateBall.speedY = -updateBall.speedY;
					updateBall.speedX = -updateBall.speedX;
				}

				paddleHit = true;
				document.getElementById('paddle-left').classList.add('collided');
				setTimeout(() => {
					document.getElementById('paddle-left').classList.remove('collided');
				}, 300);
			}

			if (ballRight >= containerWidth - paddleWidth &&
				ballTop < paddleRightBottom &&
				ballBottom > paddleRightTop) {

				if (ballTop > paddleRightTop && ballBottom < paddleRightBottom) {
					updateBall.speedX = -updateBall.speedX;
					updateBall.speedY += Math.random() * 2 - 1;
				}
				else if (ballTop <= paddleRightTop + ballRadius || ballBottom >= paddleRightBottom - ballRadius) {
					updateBall.speedY = -updateBall.speedY;
					updateBall.speedX = -updateBall.speedX;
				}

				paddleHit = true;
				document.getElementById('paddle-right').classList.add('collided');
				setTimeout(() => {
					document.getElementById('paddle-right').classList.remove('collided');
				}, 300);
			}

			if (ballTop <= 0) {
				updateBall.speedY = -updateBall.speedY;
				updateBall.y = ballRadius;
			}

			if (ballBottom >= containerHeight) {
				updateBall.speedY = -updateBall.speedY;
				updateBall.y = containerHeight - ballRadius;
			}

			if (ballLeft < 0) {
				setScore((prevScore) => {
					const newScore = { ...prevScore, right: prevScore.right + 0.5 };
					return newScore;
				});
				checkWinner();
				setPopupMessage('Player 2 scored!');
				setPopupVisible(true);
				pauseGame();
				resetGame();
			}

			if (ballRight > containerWidth) {
				setScore((prevScore) => {
					const newScore = { ...prevScore, left: prevScore.left + 0.5 };
					return newScore;
				});
				checkWinner();
				setPopupMessage('Player 1 scored!');
				setPopupVisible(true);
				pauseGame();
				resetGame();
			}

			if (paddleHit) {
				collisionCountRef.current += 1;
				if (collisionCountRef.current >= 10) {
					updateBall.speedX *= 1.2;
					updateBall.speedY *= 1.2;
					collisionCountRef.current = 0;
				}
			}

			if (gameMode === 'cpu') {
				if (updateBall && updateBall.y !== undefined) {
					moveCPUPaddle(updateBall);
				}
			}

			if (Math.abs(updateBall.speedX) >= 6 || Math.abs(updateBall.speedY) >= 6) {
				document.querySelector('.ball').classList.add('burn-effect');
			} else {
				document.querySelector('.ball').classList.remove('burn-effect');
			}

			return updateBall;
		});
	};

	const moveCPUPaddle = (ball) => {
		if (!ball || ball.y === undefined) return;

		const ballSpeedY = Math.abs(ball.speedY);
		const cpuSpeed = ballSpeedY - 0.1;

		const ballCenterY = ball.y;
		const paddleCenterY = paddlesRef.current.right + paddleHeight / 2;

		const tolerance = 20;

		const diff = ballCenterY - paddleCenterY;
	  
		if (diff > tolerance) {
			movePaddle('right', cpuSpeed);
		} else if (diff < -tolerance) {
			movePaddle('right', -cpuSpeed);
		}
	};

	const movePaddle = (side, speed) => {
		setPaddles((prevPaddles) => {
			let updatePaddles = { ...prevPaddles };
			if (side === 'right') {
				updatePaddles.right = Math.max(Math.min(updatePaddles.right + speed, containerHeight - paddleHeight), 0);
				paddlesRef.current.right = updatePaddles.right;
			} else if (side === 'left') {
				updatePaddles.left = Math.max(Math.min(updatePaddles.left + speed, containerHeight - paddleHeight), 0);
				paddlesRef.current.left = updatePaddles.left;
			}
			return updatePaddles;
		});
	};

	const resetGame = () => {
		setBall(initialBallState);
		setPaddles(initialPaddleState);
		collisionCountRef.current = 0;
		
	};

	const startGame = () => {
		setGameOver(false);
		setGameRunning(true);
		intervalRef.current = setInterval(updateBallPosition, 50);
	};

	const pauseGame = () => {
		setGameRunning(false);
		clearInterval(intervalRef.current);
		clearInterval(cpuIntervalRef.current);
	};

	const restartGame = () => {
		setBall(initialBallState);
		setPaddles(initialPaddleState);
		setScore(initialScore);
		collisionCountRef.current = 0;
		setPopupVisible(false);
		setWinnerPopupVisible(false);
		intervalRef.current = setInterval(updateBallPosition, 50);
		if (gameMode === 'cpu') {
			cpuIntervalRef.current = setInterval(moveCPUPaddle, 50);
		}
	};

	const toggleGameMode = () => {
		resetGame();
		setGameMode(gameMode === 'human' ? 'cpu' : 'human');

		if (gameMode === 'cpu') {
			cpuIntervalRef.current = setInterval(moveCPUPaddle, 50);
		} else {
			clearInterval(cpuIntervalRef.current);
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
			const speed = e.repeat ? fastMoveSpeed : moveSpeed;
			if (!keyPressedRef.current.right) {
				keyPressedRef.current.right = true;
				moveIntervalRef.current = setInterval(() => {
					movePaddle('right', e.key === 'ArrowUp' ? -speed : speed);
				}, 50);
			}
		} else if (e.key === 'w' || e.key === 'd') {
			const speed = e.repeat ? fastMoveSpeed : moveSpeed;
			if (!keyPressedRef.current.left) {
				keyPressedRef.current.left = true;
				moveIntervalRef.current = setInterval(() => {
					movePaddle('left', e.key === 'w' ? -speed : speed);
				}, 50);
			}
		}
	};

	const handleKeyUp = (e) => {
		if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
			keyPressedRef.current.right = false;
			clearInterval(moveIntervalRef.current);
		} else if (e.key === 'w' || e.key === 'd') {
			keyPressedRef.current.left = false;
			clearInterval(moveIntervalRef.current);
		}
	};

	const closeWinnerPopup = () => {
		setWinnerPopupVisible(false);
		restartGame();
	};

	useEffect(() => {
		if (gameRunning) {
			window.addEventListener('keydown', handleKeyPress);
			window.addEventListener('keyup', handleKeyUp);

			intervalRef.current = setInterval(updateBallPosition, 50);
			return () => {
				window.removeEventListener('keydown', handleKeyPress);
				window.removeEventListener('keyup', handleKeyUp);
				clearInterval(intervalRef.current);
				clearInterval(cpuIntervalRef.current);
			};
		}
	}, [gameRunning]);

	useEffect(() => {
		if (gameRunning && gameMode === 'cpu') {
			const interval = setInterval(() => {
				moveCPUPaddle(ball);
			}, 50);

			return () => clearInterval(interval);
		}
	}, [gameRunning, gameMode, ball]);		

	useEffect(() => {
		if (popupVisible && !winnerPopupVisible) {
			setGameRunning(false);
			clearInterval(intervalRef.current);
			clearInterval(cpuIntervalRef.current);
			const timeout = setTimeout(() => {
				setPopupVisible(false);
				setGameRunning(true);
				intervalRef.current = setInterval(updateBallPosition, 50);
			}, 2000);

			return () => clearTimeout(timeout);
		}
	}, [popupVisible, winnerPopupVisible]);

	return (
		<React.Fragment>
			<div className='pong-container' tabIndex="0">
				<div
					className={`paddle paddle-left ${gameRunning ? '' : 'paused'}`}
					id='paddle-left'
					style={{ top: `${paddles.left}px` }}
				/>
				<div
					className={`paddle paddle-right ${gameMode === 'cpu' && gameRunning ? 'cpu-active' : 'human-active'}`}
					id='paddle-right'
					style={{ top: `${paddles.right}px`, left: '580px' }}
				/>
				<div
					className={`ball ${gameRunning ? '' : 'paused'}`}
					style={{ top: `${ball.y}px`, left: `${ball.x}px` }}
				/>
				<div className='score-display'>
					<span>{score.left}</span> - <span>{score.right}</span>
				</div>
			</div>

			{popupVisible && !winnerPopupVisible && (
				<div className='popup'>
					<p>{popupMessage}</p>
				</div>
			)}

			{winnerPopupVisible && (
				<div className='popup' onClick={closeWinnerPopup}>
					<p>{winnerPopup}</p>
				</div>
			)}

			<div className='controls'>
				<button onClick={startGame}>Start</button>
				<button onClick={restartGame}>Restart</button>
				<button onClick={pauseGame}>Pause</button>
				<button onClick={toggleGameMode}>Game Mode (PvP/PvE)</button>
			</div>
		</React.Fragment>
	);
};

export default App;