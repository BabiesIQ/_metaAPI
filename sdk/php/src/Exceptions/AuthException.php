<?php declare(strict_types=1);
namespace BabiesIQ\Exceptions;
class AuthException extends BabiesIQException {
    public function __construct(string $message = 'Invalid or missing API key') {
        parent::__construct($message, 401);
    }
}
