from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone

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
    REQUIRED_FIELDS = []

    objects = UsuarioManager()

    def __str__(self):
        return self.email
class Profissional(models.Model):
    cpf = models.CharField(max_length=14, unique=True)
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, null=True, blank=True)
    nome = models.CharField(max_length=100, blank=True)
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
    def save(self, *args, **kwargs):
        if self.usuario:
            self.nome = self.usuario.nome
        super().save(*args, **kwargs)
    
    def __str__(self):
        if self.usuario:
            return f"{self.usuario.nome} ({self.cpf})"
        return f"(Sem usuário) {self.cpf}"
