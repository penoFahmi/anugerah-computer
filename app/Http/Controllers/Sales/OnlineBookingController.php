<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\OnlineBooking;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OnlineBookingController extends Controller
{
    /**
     * Display a listing of the online bookings.
     */
    public function index(Request $request): Response
    {
        $query = OnlineBooking::with('product')->latest();

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('customer_name', 'like', "%{$search}%")
                ->orWhere('booking_number', 'like', "%{$search}%")
                ->orWhere('customer_phone', 'like', "%{$search}%");
        }

        $bookings = $query->paginate(10)->withQueryString();

        return Inertia::render('sales/online-booking/list', [
            'bookings' => $bookings,
            'filters' => $request->only(['search']),
        ]);
    }
}
