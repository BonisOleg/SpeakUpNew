from django import forms
from .models import TrialLesson


class TrialLessonForm(forms.ModelForm):
    class Meta:
        model = TrialLesson
        fields = ['name', 'phone']
        widgets = {
            'name': forms.TextInput(attrs={
                'placeholder': "Ім'я",
                'class': 'form-group__input',
                'required': True,
            }),
            'phone': forms.TextInput(attrs={
                'placeholder': '+380',
                'class': 'form-group__input',
                'type': 'tel',
                'inputmode': 'tel',
                'pattern': r'\+380\d{9}',
                'required': True,
            }),
        }

    def clean_name(self):
        """Валідація імені: мінімум 2 символи"""
        name = self.cleaned_data.get('name', '').strip()
        if name and len(name) < 2:
            raise forms.ValidationError("Ім'я має містити мінімум 2 символи")
        return name

    def clean_phone(self):
        """Нормалізувати телефон: видалити пробіли"""
        phone = self.cleaned_data.get('phone', '')
        if phone:
            # Видалити всі пробіли
            phone = phone.replace(' ', '')
        return phone





