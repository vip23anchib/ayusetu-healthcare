from rest_framework import serializers
from accounts.serializers import UserSerializer
from accounts.models import User
from .models import Doctor, DoctorWorkingHours, DoctorLeave

class DoctorWorkingHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorWorkingHours
        fields = ('id', 'doctor', 'day_of_week', 'start_time', 'end_time')
        read_only_fields = ('doctor',)

class DoctorLeaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorLeave
        fields = ('id', 'doctor', 'leave_date', 'reason')
        read_only_fields = ('doctor',)

class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    working_hours = DoctorWorkingHoursSerializer(many=True, read_only=True)
    leaves = DoctorLeaveSerializer(many=True, read_only=True)

    class Meta:
        model = Doctor
        fields = ('id', 'user', 'specialization', 'slot_duration', 'working_hours', 'leaves', 'created_at', 'updated_at')

class DoctorCreateUpdateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True)
    name = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Doctor
        fields = ('id', 'email', 'name', 'password', 'specialization', 'slot_duration')

    def create(self, validated_data):
        email = validated_data.pop('email')
        name = validated_data.pop('name')
        password = validated_data.pop('password', 'defaultpassword123')
        
        # Create user with role DOCTOR
        user = User.objects.create_user(
            email=email,
            name=name,
            password=password,
            role=User.Role.DOCTOR
        )
        doctor = Doctor.objects.create(user=user, **validated_data)
        
        # Auto-create standard Mon-Fri working hours (9 AM - 5 PM)
        from doctors.models import DoctorWorkingHours
        import datetime
        for day in range(5):  # Mon-Fri
            DoctorWorkingHours.objects.create(
                doctor=doctor,
                day_of_week=day,
                start_time=datetime.time(9, 0),
                end_time=datetime.time(17, 0)
            )
        return doctor

    def update(self, instance, validated_data):
        email = validated_data.pop('email', None)
        name = validated_data.pop('name', None)
        
        if email:
            instance.user.email = email
            instance.user.username = email
        if name:
            instance.user.name = name
        instance.user.save()
        
        instance.specialization = validated_data.get('specialization', instance.specialization)
        instance.slot_duration = validated_data.get('slot_duration', instance.slot_duration)
        instance.save()
        return instance
