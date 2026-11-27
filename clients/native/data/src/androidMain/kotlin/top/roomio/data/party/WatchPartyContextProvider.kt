package top.roomio.data.party

import android.content.ContentProvider
import android.content.ContentValues
import android.database.Cursor
import android.net.Uri

/** Application context shared by Android data adapters initialized by the provider. */
internal object AppContextHolder {
    lateinit var appContext: android.content.Context
}

/**
 * Initializes [AppContextHolder] from the application context before any app component runs.
 */
internal class WatchPartyContextProvider : ContentProvider() {
    override fun onCreate(): Boolean {
        AppContextHolder.appContext = context?.applicationContext ?: return false
        return true
    }

    override fun query(uri: Uri, projection: Array<out String>?, selection: String?, selectionArgs: Array<out String>?, sortOrder: String?): Cursor? = null

    override fun getType(uri: Uri): String? = null

    override fun insert(uri: Uri, values: ContentValues?): Uri? = null

    override fun delete(uri: Uri, selection: String?, selectionArgs: Array<out String>?): Int = 0

    override fun update(uri: Uri, values: ContentValues?, selection: String?, selectionArgs: Array<out String>?): Int = 0
}
