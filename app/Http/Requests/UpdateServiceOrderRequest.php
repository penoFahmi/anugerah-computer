<?php

namespace App\Http\Requests;

use App\Enums\ServiceStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateServiceOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(ServiceStatus::class)],
            'estimated_cost' => ['nullable', 'numeric', 'min:0'],
            'technician_notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}