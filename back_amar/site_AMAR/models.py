from datetime import datetime, timedelta
from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.core.exceptions import ValidationError


# Gerenciador personalizado para a criação de usuários e superusuários
class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("O email é obrigatório")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if not password:
            raise ValueError("Superuser deve ter uma senha")

        return self.create_user(email=email, password=password, **extra_fields)


# Modelo customizado para representar os usuários do sistema
class Usuario(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    nome = models.CharField(max_length=100)
    cpf = models.CharField(max_length=14, unique=True)
    telefone = models.CharField(max_length=20)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
   
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['cpf','nome']

    objects = UsuarioManager()

    def __str__(self):
        return self.email
    
    
# Modelo que representa um profissional atendente, vinculado a um usuário
class Profissional(models.Model):
    cpf = models.CharField(max_length=14, unique=True)
    usuario = models.OneToOneField(Usuario, on_delete=models.SET_NULL, null=True, blank=True)
    nome = models.CharField(max_length=100, blank=True)
    matricula = models.CharField(max_length=20, blank=True, unique=True)
    telefone = models.CharField(max_length=20, blank=True)
    tipo_servico = models.CharField(max_length=50, blank=True)  # sem cedilha 
    
    def save(self, *args, **kwargs):
        if self.usuario:
            self.nome = self.usuario.nome
        super().save(*args, **kwargs)
        
    def __str__(self):
        if self.usuario:
            return f"{self.usuario.nome} ({self.cpf})"
        return f"(Sem usuário) {self.cpf}"


# Modelo que representa um estagiário atendente, vinculado a um usuário
class Estagiario(models.Model):
    cpf = models.CharField(max_length=14, unique=True)
    usuario = models.OneToOneField(Usuario, on_delete=models.SET_NULL, null=True, blank=True)
    nome = models.CharField(max_length=100, blank=True)
    matricula = models.CharField(max_length=20, blank=True, unique=True)
    telefone = models.CharField(max_length=20, blank=True)
    tipo_servico = models.CharField(max_length=50, blank=True)  # sem cedilha 
    
    def save(self, *args, **kwargs):
        if self.usuario:
            self.nome = self.usuario.nome
        super().save(*args, **kwargs)
    
    def __str__(self):
        if self.usuario:
            return f"{self.usuario.nome} ({self.cpf})"
        return f"(Sem usuário) {self.cpf}"


# Modelo que representa a disponibilidade de um atendente (Profissional ou Estagiário)
class Disponibilidade(models.Model):
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    atendente = GenericForeignKey('content_type', 'object_id')

    dia = models.DateField()
    horario = models.CharField(max_length=50) 
    local = models.CharField(max_length=100, blank=True, null=True)
    sala = models.CharField(max_length=50, blank=True, null=True)
    
    def clean(self):
        super().clean()
        if self.content_type.model_class() not in [Profissional, Estagiario]:
            raise ValidationError("Disponibilidade só pode ser atribuída a Profissional ou Estagiário.")

        if Disponibilidade.objects.filter(
            content_type=self.content_type,
            object_id=self.object_id,
            dia=self.dia,
            horario=self.horario,
            local=self.local,
            sala=self.sala
        ).exists():
            raise ValidationError("Já existe uma disponibilidade para esse atendente neste dia e horário.")

    def __str__(self):
        return f'{self.atendente.nome} - {self.dia} ({self.horario}) {self.local}, {self.sala}'

# Modelo que representa um agendamento feito por um usuário com um atendente (Profissional ou Estagiário)
class Agendamento(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    atendente = GenericForeignKey('content_type', 'object_id')

    dia = models.DateField()
    horario = models.CharField(max_length=50)
    local = models.CharField(max_length=100, blank=True, null=True)
    sala = models.CharField(max_length=50, blank=True, null=True)    # Novo campo 

    criado_em = models.DateTimeField(auto_now_add=True)

    STATUS_CHOICES = [
        ('realizado', 'Realizado'),  
        ('confirmado', 'Confirmado'),  
        ('cancelado', 'Cancelado'),
    ]

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Confirmado')
    

    def clean(self):
        super().clean()

        # Confirma que o atendente é Profissional ou Estagiario
        if self.content_type.model_class() not in [Profissional, Estagiario]:
            raise ValidationError("Agendamento só pode ser com Profissional ou Estagiário.")

        # Verifica se o horário já está agendado para o atendente, excluindo o próprio registro em edição
        agendamentos_duplicados = Agendamento.objects.filter(
            content_type=self.content_type,
            object_id=self.object_id,
            dia=self.dia,
            horario=self.horario,
            local=self.local,
            sala=self.sala
        )
        if self.pk:
            agendamentos_duplicados = agendamentos_duplicados.exclude(pk=self.pk)

        if agendamentos_duplicados.exists():
            raise ValidationError("Este horário já está agendado para este atendente.")

        # Limitar 3 agendamentos por semana com atendentes diferentes

        # Define o início e fim da semana (segunda a domingo)
        inicio_semana = self.dia - timedelta(days=self.dia.weekday())
        fim_semana = inicio_semana + timedelta(days=6)

        agendamentos_semana = Agendamento.objects.filter(
            usuario=self.usuario,
            dia__range=(inicio_semana, fim_semana),
        )
        if self.pk:
            agendamentos_semana = agendamentos_semana.exclude(pk=self.pk)

        atendentes_semana = agendamentos_semana.values_list('content_type', 'object_id').distinct()

        atendente_atual = (self.content_type_id, self.object_id)
        if atendente_atual not in atendentes_semana:
            if atendentes_semana.count() >= 3:
                raise ValidationError("Você já atingiu o limite de 3 agendamentos com atendentes diferentes nesta semana.")
            
    def save(self, *args, **kwargs):
            self.full_clean()  # Executa clean()

            # Concatena dia + horario e converte para datetime
            try:
                horario_obj = datetime.strptime(self.horario, "%H:%M").time()
                data_hora = datetime.combine(self.dia, horario_obj)
                data_hora = timezone.make_aware(data_hora)
            except Exception as e:
                print("Erro ao converter horário:", e)
                data_hora = None

            if data_hora and data_hora < timezone.now() and self.status == 'confirmado':
                self.status = 'realizado'

            super().save(*args, **kwargs)
            
            
            
class Forums(models.Model):
    imag_png = models.ImageField(upload_to='imagens/')
    nome = models.CharField(max_length=100, blank=True)
    publicacao = models.CharField(max_length=150, blank=True) 
    like = models.IntegerField(default=0)  #REANALIZAR ACHO QUE ESTÁ INCORRETO!
    def __str__(self):
        return self.nome