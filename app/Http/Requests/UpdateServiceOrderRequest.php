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
            'is_full_update' => ['nullable', 'boolean'],
            'status' => ['required', Rule::enum(ServiceStatus::class)],
            'estimated_cost' => ['nullable', 'numeric', 'min:0'],
            'final_cost' => ['nullable', 'numeric', 'min:0'],
            'down_payment' => [
                'nullable', 
                'numeric', 
                'min:0',
                function ($attribute, $value, $fail) {
                    $serviceOrder = $this->route('serviceOrder');
                    $estimatedCost = (float) $this->input('estimated_cost', $serviceOrder->estimated_cost ?? 0);
                    $finalCost = (float) $this->input('final_cost', $serviceOrder->final_cost ?? 0);
                    
                    $maxCost = max($estimatedCost, $finalCost);
                    
                    if ($maxCost > 0 && $value > $maxCost) {
                        $fail('Uang muka (DP) tidak boleh melebihi total biaya servis.');
                    }
                }
            ],
            'technician_notes' => ['nullable', 'string', 'max:2000'],
            'warranty_days' => ['nullable', 'integer', 'min:0', 'max:365'],
            'payment_method' => ['nullable', 'string', 'in:cash,transfer,qris'],
            'send_wa' => ['nullable', 'boolean'],
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
                'is_unit_left_at_store' => ['nullable', 'boolean'],
            ]);
        }

        return $rules;
    }
}
