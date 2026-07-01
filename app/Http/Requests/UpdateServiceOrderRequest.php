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
        // Validasi dasar untuk operasional teknisi (selalu wajib)
        $rules = [
            'status' => ['required', Rule::enum(ServiceStatus::class)],
            'estimated_cost' => ['nullable', 'numeric', 'min:0'],
            'final_cost' => ['nullable', 'numeric', 'min:0'],
            'technician_notes' => ['nullable', 'string', 'max:2000'],
            'warranty_days' => ['nullable', 'integer', 'min:0', 'max:365'],
            'is_full_update' => ['nullable', 'boolean'],
        ];

        // Validasi tambahan JIKA ini adalah form Edit Lengkap dari Front Office/Admin
        if ($this->boolean('is_full_update')) {
            $rules = array_merge($rules, [
                'name' => ['required', 'string', 'max:150'],
                'phone' => ['required', 'string', 'max:25'],
                'device_type' => ['nullable', 'string', 'max:50'],
                'brand' => ['nullable', 'string', 'max:50'],
                'model' => ['nullable', 'string', 'max:100'],
                'complaint' => ['required', 'string'],
                'equipments' => ['nullable', 'array'],
            ]);
        }

        return $rules;
    }
}
