"""SSH tunnel manager — opens a local-forward tunnel to the VPS Qdrant."""
from __future__ import annotations
import logging
from typing import Optional
from sshtunnel import SSHTunnelForwarder
from .config import Config

log = logging.getLogger(__name__)


class TunnelManager:
    """Manages an SSH tunnel from local machine to remote Qdrant."""

    def __init__(self, cfg: Config):
        self.cfg = cfg
        self.tunnel: Optional[SSHTunnelForwarder] = None

    def start(self) -> int:
        """Start the tunnel. Returns the local bound port."""
        if not self.cfg.ssh_tunnel_enabled:
            log.info("SSH tunnel disabled — connecting directly to %s:%s",
                     self.cfg.qdrant_host, self.cfg.qdrant_port)
            return self.cfg.qdrant_port

        if self.tunnel is not None and self.tunnel.is_active:
            return self.tunnel.local_bind_port

        log.info("Opening SSH tunnel to %s@%s -> %s:%s",
                 self.cfg.ssh_user, self.cfg.ssh_host,
                 self.cfg.ssh_remote_host, self.cfg.ssh_remote_port)

        self.tunnel = SSHTunnelForwarder(
            (self.cfg.ssh_host, 22),
            ssh_username=self.cfg.ssh_user,
            ssh_pkey=self.cfg.ssh_key_path or None,
            remote_bind_address=(self.cfg.ssh_remote_host, self.cfg.ssh_remote_port),
            local_bind_address=("127.0.0.1", self.cfg.ssh_local_bind_port),
            set_keepalive=30.0,
        )
        self.tunnel.start()
        log.info("SSH tunnel active on local port %d", self.tunnel.local_bind_port)
        return self.tunnel.local_bind_port

    def stop(self) -> None:
        if self.tunnel is not None and self.tunnel.is_active:
            log.info("Closing SSH tunnel")
            self.tunnel.stop()
            self.tunnel = None

    def __enter__(self) -> int:
        return self.start()

    def __exit__(self, exc_type, exc, tb) -> None:
        self.stop()
