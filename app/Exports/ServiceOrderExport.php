<?php

namespace App\Exports;

use App\Models\ServiceOrder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

use Illuminate\Database\Eloquent\Builder;

class ServiceOrderExport implements FromQuery, WithHeadings, WithMapping
{
    public function query(): Builder
    {
        return ServiceOrder::query()->with(['customer', 'device']);
    }

    public function headings(): array
    {
        return [
            'Order Number',
            'Customer Name',
            'Customer Phone',
            'Device Brand',
            'Device Model',
            'Complaint',
            'Status',
            'Estimated Cost',
            'Down Payment',
            'Final Cost',
            'Technician Notes',
            'Created At',
        ];
    }

    public function map($service): array
    {
        return [
            $service->order_number,
            $service->customer->name,
            $service->customer->phone,
            $service->device->brand,
            $service->device->model,
            $service->complaint,
            $service->status->value,
            $service->estimated_cost,
            $service->down_payment,
            $service->final_cost,
            $service->technician_notes,
            $service->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
