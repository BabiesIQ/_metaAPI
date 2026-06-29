<?php

declare(strict_types=1);

namespace BabiesIQ\Exceptions;

class BabiesIQException extends \RuntimeException
{
    public function __construct(string $message = 'BabiesIQ API error', int $code = 0, ?\Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
