import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
	const ballRadius = 10;
	const initialBallState = { x: 300, y: 200, speedX: 5, speedY: 5 };
	const initialPaddleState = { left: 150, right: 150 };
	const [gameOver, setGameOver] = useState(false);
	const [gameRunning, setGameRunning] = useState(false);
	const containerHeight = 390;
	const containerWidth = 588;
	const paddleHeight = 90;
	const paddleWidth = 15;

	const ballRef = useRef(initialBallState);
	const paddlesRef = useRef(initialPaddleState);
	const intervalRef = useRef(null);

	const updateBallPosition = () => {
		const ball = ballRef.current;
		const paddles = paddlesRef.current;
		ball.x += ball.speedX;
		ball.y += ball.speedY;

		const ballLeft = ball.x - ballRadius;
		const ballRight = ball.x + ballRadius;
		const ballTop = ball.y - ballRadius;
		const ballBottom = ball.y + ballRadius;

		const paddleLeftTop = paddles.left;
		const paddleLeftBottom = paddles.left + paddleHeight;
		const paddleRightTop = paddles.right;
		const paddleRightBottom = paddles.right + paddleHeight;

		if (
			ballLeft <= paddleWidth &&
			ballRight >= 0 &&
			ballTop < paddleLeftBottom &&
			ballBottom > paddleLeftTop
		) {
			ball.speedX = -ball.speedX;
			ball.speedY = ball.speedY + (Math.random() * 2 - 1);
		}

		if (
			ballRight >= containerWidth - paddleWidth &&
			ballLeft <= containerWidth &&
			ballTop < paddleRightBottom &&
			ballBottom > paddleRightTop
		) {
			ball.speedX = -ball.speedX;
			ball.speedY = ball.speedY + (Math.random() * 2 - 1);
		}

		if (ballTop <= 0) {
			ball.speedY = -ball.speedY;
			ball.y = ballRadius;
		}

		if (ballBottom >= containerHeight) {
			ball.speedY = -ball.speedY;
			ball.y = containerHeight - ballRadius;
		}

		if (ballLeft < 0 || ballRight > containerWidth) {
			setGameOver(true);
			pauseGame();
			ballRef.current = initialBallState;
		}

		forceUpdate();
	};

	const handleKeyPress = (e) => {
		const paddles = paddlesRef.current;
		switch (e.key) {
			case 'ArrowUp' :
				paddles.right = Math.max(paddles.right - 10, 0);
				break;
			case 'ArrowDown':
				paddles.right = Math.min(paddles.right + 10, containerHeight - paddleHeight);
				break;
			case 'w':
				paddles.left = Math.max(paddles.left - 10, 0);
				break;
			case 'd':
				paddles.left = Math.min(paddles.left + 10, containerHeight - paddleHeight);
				break;
			default:
				break;
		}
		forceUpdate();
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
		ballRef.current = initialBallState;
		paddlesRef.current = initialPaddleState;
		setGameOver(false);
		setGameRunning(true);
		intervalRef.current = setInterval(updateBallPosition, 50);
	};

	const [, forceUpdate] = useState(0);
	const triggerUpdate = () => forceUpdate((x) => x + 1);

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
				style={{ top: `${paddlesRef.current.left}px` }}
			/>
			<div
				className={`paddle paddle-right ${gameRunning ? '' : 'paused'}`}
				id='paddle-right'
				style={{ top: `${paddlesRef.current.right}px`, left: '580px' }}
			/>
			<div
				className={`ball ${gameRunning ? '' : 'paused'}`}
				style={{ top: `${ballRef.current.y}px`, left: `${ballRef.current.x}px` }}
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