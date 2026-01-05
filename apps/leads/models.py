from django.db import models
from django.core.validators import RegexValidator


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
        max_length=13,
        validators=[phone_validator],
        verbose_name="Телефон"
    )

    # UTM параметри (для реклами):
    utm_source = models.CharField(max_length=100, blank=True)
    utm_medium = models.CharField(max_length=100, blank=True)
    utm_campaign = models.CharField(max_length=100, blank=True)
    utm_content = models.CharField(max_length=100, blank=True)
    utm_term = models.CharField(max_length=100, blank=True)

    # Реклама:
    fbclid = models.CharField(max_length=200, blank=True, verbose_name="Facebook Click ID")
    gclid = models.CharField(max_length=200, blank=True, verbose_name="Google Click ID")
    referrer = models.URLField(max_length=500, blank=True)

    # Тест:
    test_status = models.CharField(
        max_length=20,
        choices=TEST_STATUS_CHOICES,
        default='not_started'
    )
    test_results = models.JSONField(null=True, blank=True)

    # Системні:
    created_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    # Нотифікації:
    email_sent = models.BooleanField(default=False)
    telegram_sent = models.BooleanField(default=False)
    notified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Заявка на пробний урок"
        verbose_name_plural = "Заявки на пробні уроки"

    def __str__(self):
        return f"{self.name} - {self.phone} ({self.created_at.strftime('%d.%m.%Y')})"


class RunningLineText(models.Model):
    """Текст бігучої стрічки над хедером"""
    text = models.CharField(max_length=200, verbose_name="Текст")
    is_active = models.BooleanField(default=True, verbose_name="Активний")
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок")

    class Meta:
        ordering = ['order', '-id']
        verbose_name = "Текст бігучої стрічки"
        verbose_name_plural = "Тексти бігучої стрічки"

    def __str__(self):
        return self.text[:50]





