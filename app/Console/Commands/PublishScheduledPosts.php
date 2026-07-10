<?php

namespace App\Console\Commands;

use App\Models\Post;
use Illuminate\Console\Command;

class PublishScheduledPosts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'gego:publishscheduledposts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Publish posts scheduled with "post later" whose publish time has arrived';

    /**
     * Posts created with post_later=true sit at status=pending /
     * is_posted=false with the chosen publish time in post_created_at
     * (see Api\Admin\PostController@store). This flips them live once
     * that time passes; the public API only serves status=posted.
     *
     * @return int
     */
    public function handle()
    {
        $published = Post::where('status', 'pending')
            ->where('is_posted', false)
            ->where('post_created_at', '<=', now())
            ->update([
                'is_posted' => true,
                'status'    => 'posted',
                'posted_at' => now(),
            ]);

        if ($published > 0) {
            $this->info("Published {$published} scheduled post(s).");
        }

        return 0;
    }
}
