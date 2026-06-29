<?php declare(strict_types=1);
namespace BabiesIQ\Resources;
use BabiesIQ\BabiesIQ;

class Videos {
    public function __construct(private BabiesIQ $client) {}

    public function search(string $query, bool $download = false): object {
        $data = $this->client->request('GET', '/api/video', [
            'q' => $query,
            'download' => $download ? '1' : '0',
        ]);
        return (object)$data;
    }
}
