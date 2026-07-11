package com.khaledsamir.reelseek.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import kotlinx.coroutines.flow.Flow

@Dao
interface RecentDao {
    @Query("SELECT * FROM recents ORDER BY viewedAt DESC")
    fun observeAll(): Flow<List<RecentEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsert(item: RecentEntity)

    @Query(
        "DELETE FROM recents WHERE compositeKey NOT IN " +
            "(SELECT compositeKey FROM recents ORDER BY viewedAt DESC LIMIT :maxItems)"
    )
    suspend fun trim(maxItems: Int)

    // Same semantics as RecentItem.touch on iOS: upsert then cap at 20.
    @Transaction
    suspend fun touch(item: RecentEntity, maxItems: Int = 20) {
        upsert(item)
        trim(maxItems)
    }
}
