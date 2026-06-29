<?php declare(strict_types=1);
namespace BabiesIQ\Resources;
use BabiesIQ\BabiesIQ;

class Songs {
    public function __construct(private BabiesIQ $client) {}

    public function search(string $query, bool $download = false, ?string $eq = null): object {
        $data = $this->client->request('GET', '/api/song', array_filter([
            'q' => $query,
            'download' => $download ? '1' : '0',
            'eq' => $eq,
        ]));
        return (object)$data;
    }
}
