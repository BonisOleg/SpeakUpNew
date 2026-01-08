from django.db import models
from django.utils import timezone
from django.urls import reverse
from django.utils.translation import get_language
from django.core.validators import RegexValidator, MaxValueValidator
from django.contrib.auth import get_user_model

User = get_user_model()


class BaseModel(models.Model):
    """Base model with common fields."""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class NewsArticle(BaseModel):
    """
    Модель для статей блогу новин.
    Підтримує окремі slug для UK та RU версій для збереження SEO.
    """
    # Slug для кожної мови (КРИТИЧНО для SEO - UK та RU мають різні slug!)
    slug_uk = models.SlugField(unique=True, max_length=200, db_index=True)
    slug_ru = models.SlugField(unique=True, max_length=200, null=True, blank=True, db_index=True)

    # Заголовки
    title_uk = models.CharField(max_length=200)
    title_ru = models.CharField(max_length=200, blank=True)

    # Контент (HTML) - повний HTML зі старого сайту
    content_uk = models.TextField()
    content_ru = models.TextField(blank=True)

    # SEO мета-дані
    meta_description_uk = models.TextField(max_length=500)
    meta_description_ru = models.TextField(max_length=500, blank=True)

    # Зображення
    featured_image = models.ImageField(upload_to='news/images/', null=True, blank=True)

    # Дати
    published_at = models.DateTimeField(default=timezone.now, db_index=True)

    # Для 301 редиректів (якщо URL змінився)
    old_url_uk = models.CharField(max_length=500, blank=True)
    old_url_ru = models.CharField(max_length=500, blank=True)

    # Статус
    is_published = models.BooleanField(default=True, db_index=True)

    class Meta:
        ordering = ['-published_at']
        indexes = [
            models.Index(fields=['slug_uk', 'is_published']),
            models.Index(fields=['slug_ru', 'is_published']),
            models.Index(fields=['published_at', 'is_published']),
        ]

    def __str__(self):
        return self.title_uk

    def get_absolute_url(self):
        """
        Генерує URL залежно від поточної мови.
        Використовує slug_ru для RU мови, інакше slug_uk.
        """
        lang = get_language()
        slug = self.slug_ru if lang == 'ru' and self.slug_ru else self.slug_uk
        return reverse('core:news_detail', kwargs={'slug': slug})


# ============================================================================
# Homepage Content Models
# ============================================================================

class Achievement(BaseModel):
    """Досягнення SpeakUp з лічильниками"""
    number = models.PositiveIntegerField(verbose_name="Число")
    label_uk = models.CharField(max_length=100, verbose_name="Назва (UK)")
    label_ru = models.CharField(max_length=100, blank=True, verbose_name="Назва (RU)")
    suffix = models.CharField(max_length=10, blank=True, verbose_name="Суфікс", help_text="Наприклад: +, %")
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок")
    is_active = models.BooleanField(default=True, verbose_name="Активний", db_index=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = "Досягнення"
        verbose_name_plural = "Досягнення"

    def __str__(self):
        return f"{self.number}{self.suffix} {self.label_uk}"


class Advantage(BaseModel):
    """Переваги SpeakUp з новою структурою HEADER-BODY-FOOTER"""
    # HEADER
    title_uk = models.CharField(max_length=200, verbose_name="Заголовок (UK)")
    title_ru = models.CharField(max_length=200, blank=True, verbose_name="Заголовок (RU)")
    subtitle_uk = models.CharField(max_length=200, blank=True, verbose_name="Підзаголовок (UK)")
    subtitle_ru = models.CharField(max_length=200, blank=True, verbose_name="Підзаголовок (RU)")
    tag_uk = models.CharField(max_length=150, blank=True, verbose_name="Тег (UK)")
    tag_ru = models.CharField(max_length=150, blank=True, verbose_name="Тег (RU)")

    # FOOTER
    footer_title_uk = models.CharField(max_length=200, blank=True, verbose_name="Заголовок футера (UK)")
    footer_title_ru = models.CharField(max_length=200, blank=True, verbose_name="Заголовок футера (RU)")
    footer_text_uk = models.TextField(blank=True, verbose_name="Текст футера (UK)")
    footer_text_ru = models.TextField(blank=True, verbose_name="Текст футера (RU)")

    # Загальні
    icon = models.ImageField(upload_to='advantages/', blank=True, null=True, verbose_name="Іконка")
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок")
    is_active = models.BooleanField(default=True, verbose_name="Активний", db_index=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = "Перевага"
        verbose_name_plural = "Переваги"

    def __str__(self):
        return self.title_uk


class AdvantageItem(models.Model):
    """Пункти переваги для секції BODY"""
    advantage = models.ForeignKey(
        Advantage,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name="Перевага"
    )
    icon_emoji = models.CharField(max_length=20, blank=True, verbose_name="Емодзі іконки")
    title_uk = models.CharField(max_length=100, blank=True, verbose_name="Заголовок (UK)")
    title_ru = models.CharField(max_length=100, blank=True, verbose_name="Заголовок (RU)")
    text_uk = models.TextField(verbose_name="Текст (UK)")
    text_ru = models.TextField(blank=True, verbose_name="Текст (RU)")
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок")

    class Meta:
        ordering = ['order', 'id']
        verbose_name = "Пункт переваги"
        verbose_name_plural = "Пункти переваг"

    def __str__(self):
        return f"{self.advantage.title_uk} - {self.title_uk or 'Пункт'}"


class CourseCategory(models.Model):
    """Категорія курсів (Індивідуальні/Групові)"""
    name_uk = models.CharField(max_length=100, verbose_name="Назва (UK)")
    name_ru = models.CharField(max_length=100, blank=True, verbose_name="Назва (RU)")
    slug = models.SlugField(unique=True, verbose_name="Slug")
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок")

    class Meta:
        ordering = ['order', 'id']
        verbose_name = "Категорія курсів"
        verbose_name_plural = "Категорії курсів"

    def __str__(self):
        return self.name_uk


class Course(BaseModel):
    """Навчальний курс"""
    category = models.ForeignKey(CourseCategory, on_delete=models.CASCADE, related_name='courses', verbose_name="Категорія")
    title_uk = models.CharField(max_length=200, verbose_name="Назва (UK)")
    title_ru = models.CharField(max_length=200, blank=True, verbose_name="Назва (RU)")
    short_desc_uk = models.TextField(max_length=300, verbose_name="Короткий опис (UK)")
    short_desc_ru = models.TextField(max_length=300, blank=True, verbose_name="Короткий опис (RU)")
    detail_content_uk = models.TextField(verbose_name="Детальний контент (UK)")
    detail_content_ru = models.TextField(blank=True, verbose_name="Детальний контент (RU)")
    slug = models.SlugField(unique=True, verbose_name="Slug")
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок")
    is_active = models.BooleanField(default=True, verbose_name="Активний", db_index=True)

    class Meta:
        ordering = ['category', 'order', 'id']
        verbose_name = "Курс"
        verbose_name_plural = "Курси"

    def __str__(self):
        return self.title_uk

    def get_absolute_url(self):
        return reverse('core:program_detail', kwargs={'slug': self.slug})


class Testimonial(BaseModel):
    """Відгуки клієнтів з модерацією"""
    name = models.CharField(max_length=100, verbose_name="Ім'я")
    text = models.TextField(max_length=500, verbose_name="Текст відгуку")
    rating = models.PositiveSmallIntegerField(
        default=5,
        validators=[MaxValueValidator(5)],
        verbose_name="Рейтинг",
        help_text="Від 1 до 5"
    )
    is_published = models.BooleanField(default=False, verbose_name="Опубліковано", db_index=True)
    moderated_at = models.DateTimeField(null=True, blank=True, verbose_name="Дата модерації")
    moderated_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='moderated_testimonials',
        verbose_name="Модератор"
    )

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Відгук"
        verbose_name_plural = "Відгуки"

    def __str__(self):
        return f"{self.name} - {self.created_at.strftime('%d.%m.%Y')}"


class FAQ(BaseModel):
    """Часті питання"""
    question_uk = models.CharField(max_length=200, verbose_name="Питання (UK)")
    question_ru = models.CharField(max_length=200, blank=True, verbose_name="Питання (RU)")
    answer_uk = models.TextField(verbose_name="Відповідь (UK)")
    answer_ru = models.TextField(blank=True, verbose_name="Відповідь (RU)")
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок")
    is_active = models.BooleanField(default=True, verbose_name="Активний", db_index=True)

    class Meta:
        ordering = ['order', 'id']
        verbose_name = "FAQ"
        verbose_name_plural = "FAQ"

    def __str__(self):
        return self.question_uk


class ConsultationRequest(BaseModel):
    """Заявка на консультацію"""
    phone_validator = RegexValidator(
        regex=r'^\+380\d{9}$',
        message="Введіть коректний український номер телефону"
    )
    phone = models.CharField(
        max_length=25,
        validators=[phone_validator],
        verbose_name="Телефон"
    )
    prefers_messenger = models.BooleanField(default=False, verbose_name="Консультація в переписці")
    messenger_choice = models.CharField(
        max_length=20,
        choices=[
            ('whatsapp', 'WhatsApp'),
            ('instagram', 'Instagram'),
            ('telegram', 'Telegram')
        ],
        blank=True,
        verbose_name="Месенджер"
    )
    # UTM tracking (як у TrialLesson)
    utm_source = models.CharField(max_length=100, blank=True, verbose_name="UTM Source", help_text="Джерело трафіку (google, facebook, instagram)")
    utm_medium = models.CharField(max_length=100, blank=True, verbose_name="UTM Medium", help_text="Канал (cpc, organic, social)")
    utm_campaign = models.CharField(max_length=100, blank=True, verbose_name="UTM Campaign", help_text="Назва кампанії")
    utm_content = models.CharField(max_length=100, blank=True, verbose_name="UTM Content", help_text="Контент оголошення")
    utm_term = models.CharField(max_length=100, blank=True, verbose_name="UTM Term", help_text="Ключове слово")
    fbclid = models.CharField(max_length=200, blank=True, verbose_name="Facebook Click ID")
    gclid = models.CharField(max_length=200, blank=True, verbose_name="Google Click ID")
    referrer = models.URLField(max_length=500, blank=True, verbose_name="Referrer", help_text="Сторінка, з якої прийшов користувач")
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name="IP адреса")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Заявка на консультацію"
        verbose_name_plural = "Заявки на консультацію"
        app_label = 'leads'  # Показувати в розділі "Ліди"

    def __str__(self):
        return f"{self.phone} - {self.created_at.strftime('%d.%m.%Y')}"


class ContactInfo(BaseModel):
    """Контактна інформація школи (синглтон)"""
    phone_uk = models.CharField(
        max_length=20,
        verbose_name="Телефон (UA)",
        help_text="Наприклад: +38 (093) 170-78-67"
    )
    phone_international = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="Міжнародний телефон",
        help_text="Наприклад: +48 (459) 567-884"
    )
    schedule_weekdays_uk = models.CharField(
        max_length=50,
        verbose_name="Графік роботи будні (UK)",
        help_text="Наприклад: Пн-Пт: 10:00-21:30"
    )
    schedule_weekdays_ru = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="Графік роботи будні (RU)",
        help_text="Наприклад: Пн-Пт: 10:00-21:30"
    )
    schedule_weekend_uk = models.CharField(
        max_length=50,
        verbose_name="Графік роботи вихідні (UK)",
        help_text="Наприклад: Сб: 11:00-15:00"
    )
    schedule_weekend_ru = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="Графік роботи вихідні (RU)",
        help_text="Наприклад: Сб: 11:00-15:00"
    )
    is_active = models.BooleanField(
        default=True,
        verbose_name="Активний",
        db_index=True,
        help_text="Тільки один активний запис може існувати"
    )

    class Meta:
        verbose_name = "Контактна інформація"
        verbose_name_plural = "Контактна інформація"
        constraints = [
            models.UniqueConstraint(
                fields=['is_active'],
                condition=models.Q(is_active=True),
                name='unique_active_contact_info'
            )
        ]

    def __str__(self):
        return f"Контакти - {self.phone_uk}"

    def save(self, *args, **kwargs):
        """Переконатися, що тільки один активний запис"""
        if self.is_active:
            ContactInfo.objects.filter(is_active=True).exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)


class RunningLineText(models.Model):
    """Текст бігучої стрічки над хедером"""
    text = models.CharField(max_length=200, verbose_name="Текст")
    is_active = models.BooleanField(default=True, verbose_name="Активний")
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок")

    class Meta:
        ordering = ['order', '-id']
        verbose_name = "Текст бігучої стрічки"
        verbose_name_plural = "Тексти бігучої стрічки"
        db_table = 'leads_runninglinetext'  # Використовуємо існуючу таблицю

    def __str__(self):
        return self.text[:50]

