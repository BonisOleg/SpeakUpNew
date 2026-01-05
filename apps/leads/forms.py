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
                'pattern': r'(\+?380|0)\d{9}',
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
        """Нормалізувати телефон до +380XXXXXXXXX"""
        phone = self.cleaned_data.get('phone', '').strip()
        if not phone:
            return phone

        # Видалити всі пробіли, дужки, дефіси
        phone = phone.replace(' ', '').replace('(', '').replace(')', '').replace('-', '')

        # Витягти тільки цифри
        digits = ''.join(filter(str.isdigit, phone))

        # Нормалізація:
        if phone.startswith('+380') and len(digits) == 12:
            # +380XXXXXXXXX -> залишити як є
            phone = '+' + digits
        elif digits.startswith('0') and len(digits) == 10:
            # 0XXXXXXXXX -> +380XXXXXXXXX
            phone = '+380' + digits[1:]
        elif digits.startswith('380') and len(digits) == 12:
            # 380XXXXXXXXX -> +380XXXXXXXXX
            phone = '+' + digits
        elif digits.startswith('380') and len(digits) == 11:
            # Помилка: 380XXXXXXXX (тільки 8 цифр після 380)
            raise forms.ValidationError("Номер має містити 9 цифр після коду 380")
        else:
            raise forms.ValidationError("Введіть номер у форматі +380, 380 або 0")

        return phone





