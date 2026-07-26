<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\StoreSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class StoreSettingController extends Controller
{
    public function index()
    {
        $store = StoreSetting::first();
        if (!$store) {
            $store = StoreSetting::create(['store_name' => 'Anugerah Computer']);
        }
        return Inertia::render('settings/store', [
            'store' => $store
        ]);
    }

    public function update(Request $request)
    {
        $store = StoreSetting::first();

        $validated = $request->validate([
            'store_name' => 'required|string|max:255',
            'hero_badge' => 'nullable|string|max:255',
            'hero_headline' => 'nullable|string|max:255',
            'hero_headline_highlight' => 'nullable|string|max:255',
            'hero_description' => 'nullable|string',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:255',
            'whatsapp_url' => 'nullable|string|max:255',
            'facebook_url' => 'nullable|string|max:255',
            'instagram_url' => 'nullable|string|max:255',
            'tiktok_url' => 'nullable|string|max:255',
            'youtube_url' => 'nullable|string|max:255',
            'open_hours' => 'nullable|string|max:255',
            'map_embed_url' => 'nullable|string',
            'services' => 'nullable|array',
            'features' => 'nullable|array',
            'existing_slider_images' => 'nullable|array',
        ]);

        $sliderImages = $request->input('existing_slider_images', []);
        
        if ($request->hasFile('new_slider_images')) {
            foreach ($request->file('new_slider_images') as $file) {
                $path = $file->store('landing/slider', 'public');
                $sliderImages[] = '/storage/' . $path;
            }
        }
        $validated['slider_images'] = $sliderImages;

        if ($request->hasFile('logo')) {
            if ($store->logo_path) {
                $oldPath = str_replace('/storage/', '', $store->logo_path);
                Storage::disk('public')->delete($oldPath);
            }
            $logoPath = $request->file('logo')->store('landing', 'public');
            $validated['logo_path'] = '/storage/' . $logoPath;
        }

        unset($validated['existing_slider_images']);
        unset($validated['new_slider_images']);
        unset($validated['logo']);

        $store->update($validated);
        \Illuminate\Support\Facades\Cache::forget('store_name');

        return redirect()->back()->with('success', 'Pengaturan toko berhasil diperbarui.');
    }
}
