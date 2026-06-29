<?php declare(strict_types=1);
namespace BabiesIQ\Resources;
use BabiesIQ\BabiesIQ;

class Search {
    public function __construct(private BabiesIQ $client) {}

    /** @return object[] */
    public function query(string $q): array {
        $data = $this->client->request('POST', '/api/search', [], ['q' => $q]);
        return array_map(fn($item) => (object)$item, $data ?? []);
    }
}
