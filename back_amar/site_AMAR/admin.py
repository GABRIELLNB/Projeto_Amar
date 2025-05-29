from django.contrib import admin
from .models import Usuario, Profissional, Estagiario
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _

admin.site.register(Usuario)
from .models import Profissional, Estagiario

class ProfissionalAdmin(admin.ModelAdmin):
    list_display = ('cpf', 'get_nome_usuario')

    def get_nome_usuario(self, obj):
        return obj.usuario.nome if obj.usuario else "(Sem usuário)"
    get_nome_usuario.short_description = 'Nome do Usuário'

class EstagiarioAdmin(admin.ModelAdmin):
    list_display = ('cpf', 'get_nome_usuario')

    def get_nome_usuario(self, obj):
        return obj.usuario.nome if obj.usuario else "(Sem usuário)"
    get_nome_usuario.short_description = 'Nome do Usuário'

admin.site.register(Profissional, ProfissionalAdmin)
admin.site.register(Estagiario, EstagiarioAdmin)