<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class NotificationController extends Controller
{
    /**
     * Menandai satu notifikasi telah dibaca, lalu otomatis redirect ke halaman tujuan (nota).
     */
    public function markAsRead(Request $request, string $id): RedirectResponse
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        
        if ($notification->unread()) {
            $notification->markAsRead();
        }

        // Cari URL tujuan di payload JSON, jika kosong, kembali ke halaman asal
        $url = $notification->data['action_url'] ?? back()->getTargetUrl();

        return redirect()->to($url);
    }

    /**
     * Menandai semua notifikasi milik user ini sebagai telah dibaca.
     */
    public function markAllAsRead(Request $request): RedirectResponse
    {
        $request->user()->unreadNotifications->markAsRead();
        return back();
    }

    /**
     * Menghapus secara permanen satu rekaman notifikasi dari daftar.
     */
    public function destroy(Request $request, string $id): RedirectResponse
    {
        $request->user()->notifications()->findOrFail($id)->delete();
        return back();
    }
}