"""Entry point for PyInstaller-packaged desktop sidecar."""
import os
import sys
import uvicorn


def main():
    port = int(os.environ.get('HERMENEUT_PORT', '8000'))
    uvicorn.run(
        'hermeneut.api:app',
        host='127.0.0.1',
        port=port,
        log_level='info',
    )


if __name__ == '__main__':
    main()
