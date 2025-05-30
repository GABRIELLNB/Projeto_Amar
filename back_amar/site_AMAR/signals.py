from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Usuario, Profissional, Estagiario

import re

def normalizar_cpf(cpf):
    return re.sub(r'\D', '', cpf)

@receiver(post_save, sender=Usuario)
def associar_usuario(sender, instance, created, **kwargs):
    if created:
        cpf = normalizar_cpf(instance.cpf)  # normalize aqui

        try:
            prof = Profissional.objects.get(cpf=cpf)
            prof.usuario = instance
            prof.nome = instance.nome  # atualiza o nome
            prof.save()
            
            
            print(f"Usuario {instance.nome} associado como Profissional.")
            return
        except Profissional.DoesNotExist:
            pass

        try:
            est = Estagiario.objects.get(cpf=cpf)
            est.usuario = instance
            est.nome = instance.nome  # atualiza o nome
            est.save()
            
            
            print(f"Usuario {instance.nome} associado como Estagiario.")
            return
        except Estagiario.DoesNotExist:
            pass

        print(f"Usuario {instance.nome} é um usuário comum.")
