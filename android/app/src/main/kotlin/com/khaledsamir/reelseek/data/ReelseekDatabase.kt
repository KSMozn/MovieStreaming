package com.khaledsamir.reelseek.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(
    entities = [WatchlistEntity::class, RecentEntity::class],
    version = 1,
    exportSchema = false
)
abstract class ReelseekDatabase : RoomDatabase() {
    abstract fun watchlistDao(): WatchlistDao
    abstract fun recentDao(): RecentDao

    companion object {
        fun build(context: Context): ReelseekDatabase =
            Room.databaseBuilder(context, ReelseekDatabase::class.java, "reelseek.db")
                .fallbackToDestructiveMigration()
                .build()
    }
}
