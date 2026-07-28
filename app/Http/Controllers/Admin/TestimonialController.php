<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TestimonialController extends Controller
{
    public function index()
    {
        $testimonials = Testimonial::latest()->get();
        return Inertia::render('admin/testimonials/index', [
            'testimonials' => $testimonials
        ]);
    }

    public function updateStatus(Request $request, Testimonial $testimonial)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected'
        ]);

        $testimonial->update($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Status testimoni berhasil diperbarui.']);
        return redirect()->back();
    }

    public function destroy(Testimonial $testimonial)
    {
        $testimonial->delete();
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Testimoni berhasil dihapus.']);
        return redirect()->back();
    }
}
