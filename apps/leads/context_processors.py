from apps.core.models import RunningLineText


def running_line_context(request):
    """Додає тексти бігучої стрічки у всі templates"""
    try:
        running_lines = RunningLineText.objects.filter(is_active=True).order_by('order', 'id')
        running_line_texts = [line.text for line in running_lines]
        # Для сумісності зі старим кодом, якщо потрібен один текст
        running_line_text = running_line_texts[0] if running_line_texts else ''
        return {
            'running_line_texts': running_line_texts,
            'running_line_text': running_line_text  # Для сумісності
        }
    except:
        return {
            'running_line_texts': [],
            'running_line_text': ''
        }





