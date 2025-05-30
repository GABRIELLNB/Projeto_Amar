from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from django.core.exceptions import ValidationError

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


class Usuario(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    nome = models.CharField(max_length=100)
    cpf = models.CharField(max_length=14, unique=True)
    telefone = models.CharField(max_length=20)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
   
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['cpf', 'matricula']

    objects = UsuarioManager()

    def __str__(self):
        return self.email
class Profissional(models.Model):
    cpf = models.CharField(max_length=14, unique=True)
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, null=True, blank=True)
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

class Estagiario(models.Model):
    cpf = models.CharField(max_length=14, unique=True)
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, null=True, blank=True)
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

class Disponibilidade(models.Model):
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    atendente = GenericForeignKey('content_type', 'object_id')

    dia = models.DateField()
    horario = models.CharField(max_length=50)  # Exemplo: "08:00 - 12:00"

    def clean(self):
        super().clean()
        if self.content_type.model_class() not in [Profissional, Estagiario]:
            raise ValidationError("Disponibilidade só pode ser atribuída a Profissional ou Estagiário.")

        if Disponibilidade.objects.filter(
            content_type=self.content_type,
            object_id=self.object_id,
            dia=self.dia,
            horario=self.horario
        ).exists():
            raise ValidationError("Já existe uma disponibilidade para esse atendente neste dia e horário.")

    def __str__(self):
        return f'{self.atendente.nome} - {self.dia} ({self.horario})'
'''
class Forums(models.Model):
    imag_png = models.ImageField(upload_to='imagens/')
    nome = models.CharField(max_length=100, blank=True)
    publicacao = models.CharField(max_length=150, blank=True) 
    like = models.IntegerField(default=0)  #REANALIZAR ACHO QUE ESTÁ INCORRETO!
    coment = models.IntegerField(default=0) #REANALIZAR ACHO QUE ESTÁ INCORRETO!
    def __str__(self):
        return self.nome
    
'''