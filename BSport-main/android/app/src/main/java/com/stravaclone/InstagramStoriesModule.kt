package com.stravaclone

import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.io.File

class InstagramStoriesModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "InstagramStories"
    }

    @ReactMethod
    fun shareSticker(imagePath: String, promise: Promise) {
        try {
            val file = File(imagePath.replace("file://", ""))

            val uri = FileProvider.getUriForFile(
                reactApplicationContext,
                reactApplicationContext.packageName + ".provider",
                file
            )

            val intent = Intent("com.instagram.share.ADD_TO_STORY")
            intent.type = "image/png"

            // 🔥 STIKER TRANSPARAN BEBAS GESER:
            // Tanpa AppID, Instagram tidak mengunci layer.
            intent.putExtra("interactive_asset_uri", uri)

            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            intent.setPackage("com.instagram.android")

            reactApplicationContext.grantUriPermission(
                "com.instagram.android",
                uri,
                Intent.FLAG_GRANT_READ_URI_PERMISSION
            )

            reactApplicationContext.startActivity(
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            )

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("INSTAGRAM_SHARE_ERROR", e)
        }
    }
}