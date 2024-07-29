@component('components.content-block', ['class' => $type])
  <section class="c-program-events">
    @php
      $data = App::getProgramData();
    @endphp
    <div class="o-wrapper">
      <div id="program" data-program="{{ $data }}"></div>
      @if ($link = $fields['cta'])
      <div class="c-program-events__link">
        @component('components.link', ['link' => $link, 'class' => ''])
          {!! $link['title'] !!}
        @endcomponent
      </div>
      @endif
    </div>
  </section>
@endcomponent