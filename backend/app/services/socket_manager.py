import socketio
import logging

logger = logging.getLogger(__name__)

class SocketManager:
    def __init__(self):
        self.sio = socketio.AsyncServer(
            async_mode='asgi',
            cors_allowed_origins='*'
        )
        self.app = socketio.ASGIApp(self.sio)

    async def emit_alert(self, alert_data):
        """Broadcasts a new alert to all connected clients."""
        try:
            await self.sio.emit('new_alert', alert_data)
            logger.info(f"Broadcasted alert: {alert_data.get('id')}")
        except Exception as e:
            logger.error(f"Failed to emit alert: {e}")

    async def emit_log(self, log_data):
        """Broadcasts a new log entry to all connected clients."""
        try:
            await self.sio.emit('new_log', log_data)
        except Exception as e:
            logger.error(f"Failed to emit log: {e}")

socket_manager = SocketManager()

# SocketIO Events
@socket_manager.sio.event
async def connect(sid, environ):
    logger.info(f"Client connected: {sid}")

@socket_manager.sio.event
async def disconnect(sid):
    logger.info(f"Client disconnected: {sid}")
