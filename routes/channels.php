<?php

use Illuminate\Support\Facades\Broadcast;

// Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
//     return (int) $user->id === (int) $id;
// });

// 1. Lonceng Notifikasi Global
Broadcast::channel('admin.notifications', function ($user) {
    // Spatie function: hasAnyRole()
    return $user->hasAnyRole(['administrator', 'pegawai', 'teknisi']); 
});

// 2. Ruang Live Chat per-nota HANYA 
Broadcast::channel('chat.service.{serviceOrderId}', function ($user, $serviceOrderId) {
    return $user->hasAnyRole(['administrator', 'pegawai', 'teknisi']);
});