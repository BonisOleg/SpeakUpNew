from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import TrialLesson, ConsultationRequest


# Українізація Admin Site
admin.site.site_header = "SpeakUp - Адміністрування"
admin.site.site_title = "SpeakUp"
admin.site.index_title = "Панель управління"


class UnifiedLeadAdminMixin:
    """Міксін з спільними методами для обох типів лідів"""

    def get_lead_type_display(self, obj):
        """Відображення типу заявки"""
        if isinstance(obj, TrialLesson):
            return format_html('<span style="color: #0066cc;">🎓 Пробний урок</span>')
        elif isinstance(obj, ConsultationRequest):
            return format_html('<span style="color: #00aa00;">💬 Консультація</span>')
        return '-'
    get_lead_type_display.short_description = 'Тип заявки'

    def get_source_display(self, obj):
        """Відображення джерела з іконками"""
        source = obj.utm_source.lower() if obj.utm_source else ''
        medium = obj.utm_medium.lower() if obj.utm_medium else ''

        if 'google' in source or 'gclid' in str(obj.gclid):
            icon = '🔍'
            label = 'Google'
        elif 'facebook' in source or 'fb' in source or 'fbclid' in str(obj.fbclid):
            icon = '📘'
            label = 'Facebook'
        elif 'instagram' in source:
            icon = '📷'
            label = 'Instagram'
        elif 'organic' in medium or not source:
            icon = '🌐'
            label = 'Органічний трафік'
        else:
            icon = '📊'
            label = obj.utm_source or 'Не вказано'

        campaign = f' ({obj.utm_campaign})' if obj.utm_campaign else ''
        return format_html(f'{icon} <strong>{label}</strong>{campaign}')
    get_source_display.short_description = 'Джерело'

    def get_contact_info(self, obj):
        """Відображення контактної інформації"""
        if isinstance(obj, TrialLesson):
            return format_html('<strong>{}</strong><br>{}', obj.name, obj.phone)
        elif isinstance(obj, ConsultationRequest):
            return format_html('<strong>{}</strong>', obj.phone)
        return '-'
    get_contact_info.short_description = 'Контакт'

    def get_channel_display(self, obj):
        """Відображення каналу"""
        medium = obj.utm_medium or 'Не вказано'
        medium_map = {
            'cpc': '💰 Платна реклама',
            'organic': '🌿 Органічний пошук',
            'social': '📱 Соціальні мережі',
            'email': '📧 Email',
            'direct': '🔗 Прямий перехід',
        }
        return medium_map.get(medium.lower(), medium)
    get_channel_display.short_description = 'Канал'


@admin.register(TrialLesson)
class TrialLessonAdmin(admin.ModelAdmin, UnifiedLeadAdminMixin):
    """Admin для заявок на пробний урок"""
    list_display = ['get_lead_type_display', 'get_contact_info', 'get_source_display', 'get_channel_display', 'test_status', 'created_at']
    list_filter = ['test_status', 'created_at', 'utm_source', 'utm_medium', 'email_sent']
    search_fields = ['name', 'phone', 'utm_campaign', 'utm_source']
    readonly_fields = ['created_at', 'ip_address', 'fbclid', 'gclid', 'referrer']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Основна інформація', {
            'fields': ('name', 'phone', 'created_at', 'ip_address')
        }),
        ('Джерело ліду', {
            'fields': ('utm_source', 'utm_medium', 'utm_campaign'),
            'description': 'Основна інформація про джерело заявки'
        }),
        ('Деталі кампанії', {
            'fields': ('utm_content', 'utm_term'),
            'classes': ('collapse',)
        }),
        ('Рекламні ID', {
            'fields': ('fbclid', 'gclid', 'referrer'),
            'classes': ('collapse',)
        }),
        ('Тест', {
            'fields': ('test_status', 'test_results')
        }),
        ('Нотифікації', {
            'fields': ('email_sent', 'telegram_sent', 'notified_at')
        }),
        ('Технічна інформація', {
            'fields': ('ip_address',),
            'classes': ('collapse',)
        }),
    )


@admin.register(ConsultationRequest)
class ConsultationRequestAdmin(admin.ModelAdmin, UnifiedLeadAdminMixin):
    """Admin для заявок на консультацію"""
    list_display = ['get_lead_type_display', 'get_contact_info', 'get_source_display', 'get_channel_display', 'prefers_messenger', 'created_at']
    list_filter = ['prefers_messenger', 'messenger_choice', 'created_at', 'utm_source', 'utm_medium']
    search_fields = ['phone', 'utm_campaign', 'utm_source']
    readonly_fields = ['created_at', 'updated_at', 'ip_address', 'fbclid', 'gclid', 'referrer']
    date_hierarchy = 'created_at'

    fieldsets = (
        ('Основна інформація', {
            'fields': ('phone', 'prefers_messenger', 'messenger_choice', 'created_at', 'ip_address')
        }),
        ('Джерело ліду', {
            'fields': ('utm_source', 'utm_medium', 'utm_campaign'),
            'description': 'Основна інформація про джерело заявки'
        }),
        ('Деталі кампанії', {
            'fields': ('utm_content', 'utm_term'),
            'classes': ('collapse',)
        }),
        ('Рекламні ID', {
            'fields': ('fbclid', 'gclid', 'referrer'),
            'classes': ('collapse',)
        }),
        ('Технічна інформація', {
            'fields': ('ip_address', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
