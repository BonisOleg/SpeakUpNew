from django.db import models
from django.core.validators import RegexValidator
from apps.core.models import ConsultationRequest as CoreConsultationRequest


class TrialLesson(models.Model):
    """Заявка на пробний урок з відстеженням рекламних джерел"""

    TEST_STATUS_CHOICES = [
        ('not_started', 'Не розпочато'),
        ('skipped', 'Пропущено'),
        ('completed', 'Завершено'),
    ]

    # Основні дані:
    name = models.CharField(max_length=100, verbose_name="Ім'я")
    phone_validator = RegexValidator(
        regex=r'^\+380\d{9}$',
        message="Введіть коректний український номер телефону"
    )
    phone = models.CharField(
        max_length=25,
        validators=[phone_validator],
        verbose_name="Телефон"
    )

    # UTM параметри (для реклами):
    utm_source = models.CharField(max_length=100, blank=True, verbose_name="UTM Source", help_text="Джерело трафіку (google, facebook, instagram)")
    utm_medium = models.CharField(max_length=100, blank=True, verbose_name="UTM Medium", help_text="Канал (cpc, organic, social)")
    utm_campaign = models.CharField(max_length=100, blank=True, verbose_name="UTM Campaign", help_text="Назва кампанії")
    utm_content = models.CharField(max_length=100, blank=True, verbose_name="UTM Content", help_text="Контент оголошення")
    utm_term = models.CharField(max_length=100, blank=True, verbose_name="UTM Term", help_text="Ключове слово")

    # Реклама:
    fbclid = models.CharField(max_length=200, blank=True, verbose_name="Facebook Click ID")
    gclid = models.CharField(max_length=200, blank=True, verbose_name="Google Click ID")
    referrer = models.URLField(max_length=500, blank=True, verbose_name="Referrer", help_text="Сторінка, з якої прийшов користувач")

    # Тест:
    test_status = models.CharField(
        max_length=20,
        choices=TEST_STATUS_CHOICES,
        default='not_started',
        verbose_name="Статус тесту"
    )
    test_results = models.JSONField(null=True, blank=True, verbose_name="Результати тесту")

    # Системні:
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата створення")
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name="IP адреса")

    # Нотифікації:
    email_sent = models.BooleanField(default=False, verbose_name="Email відправлено")
    telegram_sent = models.BooleanField(default=False, verbose_name="Telegram відправлено")
    notified_at = models.DateTimeField(null=True, blank=True, verbose_name="Дата нотифікації")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Лід"
        verbose_name_plural = "Ліди"

    def __str__(self):
        return f"{self.name} - {self.phone} ({self.created_at.strftime('%d.%m.%Y')})"


class ConsultationRequest(CoreConsultationRequest):
    """Proxy модель для відображення ConsultationRequest в розділі "Ліди" """

    class Meta:
        proxy = True
        verbose_name = "Лід"
        verbose_name_plural = "Ліди"





