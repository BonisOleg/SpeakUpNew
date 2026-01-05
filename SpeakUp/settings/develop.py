"""
Development settings for SpeakUp project.
"""
from .base import *

DEBUG = True

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Email backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# WhiteNoise cache settings - відключено для розробки стилів
WHITENOISE_MAX_AGE = 0  # Без кешування для зручної розробки

