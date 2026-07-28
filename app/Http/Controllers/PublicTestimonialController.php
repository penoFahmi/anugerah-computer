<?php

namespace App\Http\Controllers;

use App\Models\Testimonial;
use Illuminate\Http\Request;

class PublicTestimonialController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'nullable|string|max:255',
            'text' => 'required|string',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $validated['status'] = 'pending';

        Testimonial::create($validated);

        \Inertia\Inertia::flash('toast', ['type' => 'success', 'message' => 'Terima kasih! Ulasan Anda telah dikirim dan menunggu moderasi admin.']);
        return redirect()->back();
    }
}
