<?php declare(strict_types=1);
namespace BabiesIQ\Exceptions;
class RateLimitException extends BabiesIQException {
    public function __construct(string $message = 'Rate limit exceeded') {
        parent::__construct($message, 429);
    }
}
