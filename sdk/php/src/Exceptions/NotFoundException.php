<?php declare(strict_types=1);
namespace BabiesIQ\Exceptions;
class NotFoundException extends BabiesIQException {
    public function __construct(string $message = 'Resource not found') {
        parent::__construct($message, 404);
    }
}
