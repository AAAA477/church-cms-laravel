<?php

use Faker\Generator as Faker;

$factory->define(App\Models\SermonLink::class, function (Faker $faker) {
    return [
        'title'      => $faker->sentence(4),
        'video_link' => $faker->optional()->url,
        'audio_link' => $faker->optional()->url,
        'pdf_link'   => $faker->optional()->url,
        'date'       => $faker->dateTimeBetween('-2 years', 'now'),
    ];
});
