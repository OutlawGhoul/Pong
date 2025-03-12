import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
	const ballRadius = 10;
	const initialBallState = { x: 294, y: 195, speedX: 5, speedY: 5 };
	const initialPaddleState = { left: 150, right: 150 };
	const [ball, setBall] = useState(initialBallState);
	const [paddles, setPaddles] = useState(initialPaddleState);
	const [gameOver, setGameOver] = useState(false);
	const [gameRunning, setGameRunning] = useState(false);

	const containerHeight = 390;
	const containerWidth = 588;
	const paddleHeight = 90;
	const paddleWidth = 15;

	const intervalRef = useRef(null);
  const paddlesRef = useRef(initialPaddleState);

	const updateBallPosition = () => {
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

			if (ballLeft <= paddleWidth &&
			  	ballTop < paddleLeftBottom &&
				  ballBottom > paddleLeftTop) {
			  updateBall.speedX = -updateBall.speedX;
			  updateBall.speedY = updateBall.speedY + (Math.random() * 2 - 1);
			}

			if (ballRight >= containerWidth - paddleWidth &&
				ballTop < paddleRightBottom &&
				ballBottom > paddleRightTop) {
			  updateBall.speedX = -updateBall.speedX;
			  updateBall.speedY = updateBall.speedY + (Math.random() * 2 - 1);
			}

			if (ballTop <= 0) {
				updateBall.speedY = -updateBall.speedY;
				updateBall.y = ballRadius;
			}

			if (ballBottom >= containerHeight) {
				updateBall.speedY = -updateBall.speedY;
				updateBall.y = containerHeight - ballRadius;
			}

			if (ballLeft < 0 || ballRight > containerWidth) {
				setGameOver(true);
				pauseGame();
				setBall(initialBallState);
			}

			return updateBall;
		});
	};

	const handleKeyPress = (e) => {
		setPaddles((prevPaddles) => {
			let updatePaddles = { ...prevPaddles };
			switch (e.key) {
				case 'ArrowUp' :
					updatePaddles.right = Math.max(updatePaddles.right - 10, 0);
          paddlesRef.current.right = updatePaddles.right;
					break;
				case 'ArrowDown':
					updatePaddles.right = Math.min(updatePaddles.right + 10, containerHeight - paddleHeight);
          paddlesRef.current.right = updatePaddles.right;
					break;
				case 'w':
					updatePaddles.left = Math.max(updatePaddles.left - 10, 0);
          paddlesRef.current.left = updatePaddles.left;
					break;
				case 'd':
					updatePaddles.left = Math.min(updatePaddles.left + 10, containerHeight - paddleHeight);
          paddlesRef.current.left = updatePaddles.left;
					break;
				default:
					break;
			}
			return updatePaddles;
		});
	};

	const startGame = () => {
		setGameOver(false);
		setGameRunning(true);
		intervalRef.current = setInterval(updateBallPosition, 50);
	};

	const pauseGame = () => {
		setGameRunning(false);
		clearInterval(intervalRef.current);
	};

	const restartGame = () => {
		setBall(initialBallState);
		setPaddles(initialPaddleState);
		setGameOver(false);
		setGameRunning(true);
		intervalRef.current = setInterval(updateBallPosition, 50);
	};

	useEffect(() => {
		if (gameRunning) {
			window.addEventListener('keydown', handleKeyPress);
			return () => {
				window.removeEventListener('keydown', handleKeyPress);
				clearInterval(intervalRef.current);
			};
		}
	}, [gameRunning]);

	return (
		<div className='pong-container' tabIndex="0">
			<div
				className={`paddle paddle-left ${gameRunning ? '' : 'paused'}`}
				id='paddle-left'
				style={{ top: `${paddles.left}px` }}
			/>
			<div
				className={`paddle paddle-right ${gameRunning ? '' : 'paused'}`}
				id='paddle-right'
				style={{ top: `${paddles.right}px`, left: '580px' }}
			/>
			<div
				className={`ball ${gameRunning ? '' : 'paused'}`}
				style={{ top: `${ball.y}px`, left: `${ball.x}px` }}
			/>
			<div className='controls'>
				<button onClick={startGame}>Start</button>
				<button onClick={restartGame}>Restart</button>
				<button onClick={pauseGame}>Pause</button>
			</div>
			{gameOver && <div className='game-over'>Game Over</div>}
		</div>
	);
};

export default App;