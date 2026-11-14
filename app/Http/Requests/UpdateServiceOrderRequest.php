<?php

namespace App\Http\Requests;

use App\Enums\ServiceStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

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
            'refund_amount' => ['nullable', 'numeric', 'min:0'],
            'down_payment' => [
                'nullable',
                'numeric',
                'min:0',
                function ($attribute, $value, $fail) {
                    $newStatus = $this->input('status');
                    if (in_array($newStatus, [ServiceStatus::CANCELLED->value, ServiceStatus::RETURNED->value])) {
                        return;
                    }
                    $serviceOrder = $this->route('serviceOrder');
                    $estimatedCost = (float) $this->input('estimated_cost', $serviceOrder->estimated_cost ?? 0);
                    $finalCost = (float) $this->input('final_cost', $serviceOrder->final_cost ?? 0);

                    $maxCost = max($estimatedCost, $finalCost);

                    if ($maxCost > 0 && $value > $maxCost) {
                        $fail('Uang muka (DP) tidak boleh melebihi total biaya servis.');
                    }
                },
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

    public function after(): array
    {
        return [
            function (Validator $validator) {
                $user = auth()->user();
                $serviceOrder = $this->route('serviceOrder');

                if (! $serviceOrder || ! $user) {
                    return;
                }

                $oldStatus = $serviceOrder->status->value;
                $newStatus = $this->input('status');

                // Jika status berubah dan user BUKAN administrator, jalankan validasi strict
                if ($oldStatus !== $newStatus && ! $user->hasRole('administrator')) {
                    $isValidTransition = false;

                    switch ($oldStatus) {
                        case ServiceStatus::WAITING_CHECKING->value:
                            if (in_array($newStatus, [ServiceStatus::WAITING_APPROVAL->value, ServiceStatus::CANCELLED->value, ServiceStatus::RETURNED->value])) {
                                $isValidTransition = true;
                            }
                            break;
                        case ServiceStatus::WAITING_APPROVAL->value:
                            if (in_array($newStatus, [ServiceStatus::APPROVED->value, ServiceStatus::CANCELLED->value, ServiceStatus::RETURNED->value])) {
                                $isValidTransition = true;
                            }
                            break;
                        case ServiceStatus::APPROVED->value:
                            if (in_array($newStatus, [ServiceStatus::IN_PROGRESS->value, ServiceStatus::CANCELLED->value, ServiceStatus::RETURNED->value])) {
                                $isValidTransition = true;
                            }
                            break;
                        case ServiceStatus::IN_PROGRESS->value:
                            if (in_array($newStatus, [ServiceStatus::COMPLETED->value, ServiceStatus::CANCELLED->value, ServiceStatus::RETURNED->value])) {
                                $isValidTransition = true;
                            }
                            break;
                        case ServiceStatus::COMPLETED->value:
                            if (in_array($newStatus, [ServiceStatus::TAKEN->value, ServiceStatus::CANCELLED->value, ServiceStatus::RETURNED->value, ServiceStatus::IN_PROGRESS->value])) {
                                $isValidTransition = true;
                            }
                            break;
                        case ServiceStatus::CANCELLED->value:
                            if (in_array($newStatus, [
                                ServiceStatus::RETURNED->value,
                                ServiceStatus::WAITING_CHECKING->value,
                                ServiceStatus::WAITING_APPROVAL->value,
                                ServiceStatus::APPROVED->value,
                                ServiceStatus::IN_PROGRESS->value
                            ])) {
                                $isValidTransition = true;
                            }
                            break;
                        case ServiceStatus::RETURNED->value:
                            if (in_array($newStatus, [
                                ServiceStatus::CANCELLED->value,
                                ServiceStatus::IN_PROGRESS->value,
                                ServiceStatus::COMPLETED->value
                            ])) {
                                $isValidTransition = true;
                            }
                            break;
                        case ServiceStatus::TAKEN->value:
                            if (in_array($newStatus, [
                                ServiceStatus::COMPLETED->value,
                                ServiceStatus::IN_PROGRESS->value
                            ])) {
                                $isValidTransition = true;
                            }
                            break;
                    }

                    if (! $isValidTransition) {
                        $oldLabel = $serviceOrder->status->label();
                        $newLabel = ServiceStatus::from($newStatus)->label();
                        $validator->errors()->add(
                            'status',
                            "Transisi status tidak valid. Tidak bisa mengubah status dari '{$oldLabel}' menjadi '{$newLabel}' secara langsung."
                        );

                        // Menambahkan sesi toast error manual karena form request redirect secara default
                        session()->flash('toast', [
                            'type' => 'error',
                            'message' => "Transisi status tidak valid. Tidak bisa mengubah status dari '{$oldLabel}' menjadi '{$newLabel}' secara langsung.",
                        ]);
                    }
                }
            },
        ];
    }
}
