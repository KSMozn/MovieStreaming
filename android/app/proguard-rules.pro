# kotlinx.serialization — keep serializers for our models
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.**
-keepclassmembers class com.khaledsamir.reelseek.model.** {
    *** Companion;
}
-keepclasseswithmembers class com.khaledsamir.reelseek.model.** {
    kotlinx.serialization.KSerializer serializer(...);
}

# Retrofit
-keepattributes Signature, Exceptions
-dontwarn okhttp3.**
-dontwarn retrofit2.**
