<?php

namespace App\Ai\Agents;

use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Promptable;
use Stringable;

#[Provider(Lab::Groq)]
class InternalCopilot implements Agent
{
    use Promptable;

    public function __construct(protected string $systemRole = '') {}

    public function instructions(): Stringable|string
    {
        return $this->systemRole;
    }
}
