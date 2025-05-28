from django.db import models

class User(models.Model):
    cpf = models.CharField(max_length=11, unique=True)
    nome = models.CharField(max_length=30)
    email = models.EmailField(max_length=30, unique=True)
    telefone = models.CharField(max_length=11)
    senha = models.CharField(max_length=128)  # senha criptografada

    def __str__(self):
        return f'{self.nome} ({self.cpf})'


class Estagiario(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    matricula = models.CharField(max_length=10)

    def __str__(self):
        return f'Estagiário {self.user.nome}'


class Profissional(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    matricula = models.CharField(max_length=10)
    tipo_servico = models.CharField(max_length=15)

    def __str__(self):
        return f'{self.tipo_servico} - {self.user.nome}'


class Adm(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    senha = models.CharField(max_length=128)  # também deve usar criptografia

    def __str__(self):
        return f'Administrador {self.user.nome}'


class Agendamento(models.Model):
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('concluido', 'Concluído'),
        ('cancelado', 'Cancelado'),
    ]

    data_agendamento = models.DateField()
    hora = models.TimeField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pendente')
    tipo_servico_prof = models.ForeignKey(Profissional, on_delete=models.CASCADE)
    paciente = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.data_agendamento} {self.hora} - {self.paciente.nome}'


def get_tipo_usuario(user):
    if hasattr(user, 'profissional'):
        return 'profissional'
    elif hasattr(user, 'estagiario'):
        return 'estagiario'
    else:
        return 'usuario'
