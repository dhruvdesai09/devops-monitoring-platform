import time
import random
import requests
import psutil
import os
from datetime import datetime

BACKEND_URL = os.getenv('BACKEND_URL', 'http://backend:5000')

def collect_metrics():
    metrics = {
        'cpu_usage': psutil.cpu_percent(interval=1),
        'memory_usage': psutil.virtual_memory().percent,
        'disk_usage': psutil.disk_usage('/').percent,
        'network_sent': psutil.net_io_counters().bytes_sent / (1024**3),
        'active_connections': random.randint(50, 200)
    }
    return metrics

def send_metrics(metrics):
    for metric_name, value in metrics.items():
        try:
            response = requests.post(
                f'{BACKEND_URL}/api/metrics',
                json={'metric_name': metric_name, 'value': value},
                timeout=5
            )
            print(f'Sent {metric_name}: {value} - Status: {response.status_code}')
        except Exception as e:
            print(f'Error sending {metric_name}: {e}')

def main():
    print('Starting metrics collector...')
    while True:
        try:
            metrics = collect_metrics()
            send_metrics(metrics)
            time.sleep(15)
        except Exception as e:
            print(f'Error in main loop: {e}')
            time.sleep(5)

if __name__ == '__main__':
    main()
