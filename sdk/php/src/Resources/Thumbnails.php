<?php declare(strict_types=1);
namespace BabiesIQ\Resources;
use BabiesIQ\BabiesIQ;

class Thumbnails {
    public function __construct(private BabiesIQ $client) {}

    public function get(string $videoId, ?string $design = null): object {
        $data = $this->client->request('GET', '/api/thumbnail', array_filter([
            'v' => $videoId,
            'design' => $design,
        ]));
        return (object)$data;
    }
}
