// Modified from code originally found as part of the TripleQ theme.
// https://github.com/raphaelquast/foobar2000_TripleQ

let colours = {
    text : 0,
    background : 0,
    highlight : 0,
};
let ColourTypeCUI = {
    text: 0,
    selection_text: 1,
    inactive_selection_text: 2,
    background: 3,
    selection_background: 4,
    inactive_selection_background: 5,
    active_item_frame: 6
};
let ColourTypeDUI = {
    text: 0,
    background: 1,
    highlight: 2,
    selection: 3
};


update_colours();


const properties = {
    font: new _p('F2K.SCROLLER.FONT', 'Segoe UI'),
    font_size_max: new _p('F2K.SCROLLER.FONTSIZEMAX', 18),
    font_size_min: new _p('F2K.SCROLLER.FONTSIZEMIN', 6),
    left_tf: new _p('F2K.SCROLLER.LEFTTF', '[%artist% - ]'),
    right_tf: new _p('F2K.SCROLLER.RIGHTTF', '[%title%]'),
    scroll_delay: new _p('F2K.SCROLLER.DELAY', 30),
    gap: new _p('F2K.SCROLLER.GAP', 80),
    show_selected_when_stopped: new _p('F2K.SCROLLER.SHOWSTOPPED', false),
    color_left: new _p('F2K.SCROLLER.LEFTCOLOR', colours.text),
    color_right: new _p('F2K.SCROLLER.RIGHTCOLOR', colours.highlight),
    color_background: new _p('F2K.SCROLLER.BACKCOLOR', colours.background)
}
let timer_running = false;
let timer_increment = 0;
let interval_id = 0;
let left_tf = null;
let right_tf = null;
let all_tf = null;


compile_tf_strings();


function compile_tf_strings() {
    left_tf = fb.TitleFormat(properties.left_tf.value);
    right_tf = fb.TitleFormat(properties.right_tf.value);
    all_tf = fb.TitleFormat(properties.left_tf.value + properties.right_tf.value);
}


function get_track_info(tf) {
    // Get the track info from playing track (if playing) or selected track.
    if (fb.IsPlaying == true) {
        return tf.Eval();
    } else {
        if (properties.show_selected_when_stopped.enabled) {
            try {
                return tf.EvalWithMetadb(fb.GetFocusItem());
            } catch(e) {
                return '';
            }
        }
        return '';
    }
}


function on_mouse_rbtn_up(x, y) {
    let menu = window.CreatePopupMenu();
    let context = fb.CreateContextMenuManager();
    let color = window.CreatePopupMenu();
    menu.AppendMenuItem(MF_STRING, 1000, 'Font\u2026');
    menu.AppendMenuItem(MF_STRING, 1010, 'Max font size\u2026');
    menu.AppendMenuItem(MF_STRING, 1020, 'Min font size\u2026');
    menu.AppendMenuItem(MF_STRING, 1030, 'Left title-formatting string\u2026');
    menu.AppendMenuItem(MF_STRING, 1040, 'Right title-formatting string\u2026');
    menu.AppendMenuItem(MF_STRING, 1050, 'Scrolling delay\u2026');
    menu.AppendMenuItem(MF_STRING, 1060, 'Gap\u2026');
    menu.AppendMenuSeparator();
    color.AppendMenuItem(MF_STRING, 2000, 'Background\u2026');
    color.AppendMenuItem(MF_STRING, 2010, 'Left\u2026');
    color.AppendMenuItem(MF_STRING, 2020, 'Right\u2026');
    color.AppendTo(menu, MF_STRING, 'Colors');
    menu.AppendMenuSeparator();
    menu.AppendMenuItem(MF_STRING, 3000, 'Show selected when stopped');
    menu.CheckMenuItem(3000, properties.show_selected_when_stopped.enabled);
    menu.AppendMenuSeparator();
    menu.AppendMenuItem(MF_STRING, 10000, 'Reload panel');
    menu.AppendMenuItem(MF_STRING, 10010, 'Show properties\u2026');
    menu.AppendMenuItem(MF_STRING, 10020, 'Configure panel\u2026');
    const idx = menu.TrackPopupMenu(x, y);
    switch (idx) {
    case 0:
        break;
    case 1000:
        properties.font.value = utils.InputBox(0, 'Scrolling text panel font', 'Input property', properties.font.value);
        window.Repaint();
        break;
    case 1010:
        properties.font_size_max.value = utils.InputBox(0, 'Maximum font size', 'Input property', properties.font_size_max.value);
        window.Repaint();
        break;
    case 1020:
        properties.font_size_min.value = utils.InputBox(0, 'Minimum font size', 'Input property', properties.font_size_min.value);
        window.Repaint();
        break;
    case 1030:
        properties.left_tf.value = utils.InputBox(0, 'Title formatting pattern on the left', 'Input property', properties.left_tf.value);
        compile_tf_strings();
        reset_timer();
        window.Repaint();
        break;
    case 1040:
        properties.right_tf.value = utils.InputBox(0, 'Title formatting pattern on the right', 'Input property', properties.right_tf.value);
        compile_tf_strings();
        reset_timer();
        window.Repaint();
        break;
    case 1050:
        properties.scroll_delay.value = utils.InputBox(0, 'Scrolling delay (lower values for faster scrolling)', 'Input property', properties.scroll_delay.value);
        if (properties.scroll_delay.value < 1) {
            properties.scroll_delay.value = 1;
        }
        reset_timer();
        window.Repaint();
        break;
    case 1060:
        properties.gap.value = Number(utils.InputBox(0, 'Gap between full texts when scrolling', 'Input property', properties.gap.value));
        window.Repaint();
        break;
    case 2000:
        properties.color_background.value = utils.ColourPicker(window.ID, properties.color_background.value);
        window.Repaint();
        break;
    case 2010:
        properties.color_left.value = utils.ColourPicker(window.ID, properties.color_left.value);
        window.Repaint();
        break;
    case 2020:
        properties.color_right.value = utils.ColourPicker(window.ID, properties.color_right.value);
        window.Repaint();
        break;
    case 3000:
        properties.show_selected_when_stopped.toggle();
        window.Repaint();
        break;
    case 10000:
        window.Reload();
        break;
    case 10010:
        window.ShowProperties();
        break;
    case 10020:
        window.ShowConfigureV2();
        break;
    default:
        context.ExecuteByID(idx - 1);
        break;
    }
    return true;
}


function on_paint(gr) {
    let all_tags = get_track_info(all_tf);
    let left_tags = get_track_info(left_tf);
    let right_tags = get_track_info(right_tf);
    let font = get_font(properties.font_size_max.value, all_tags)
    let all_dims = calc_text(all_tags, font);
    let left_dims = calc_text(left_tags, font);
    let right_dims = calc_text(right_tags, font);
    let x_first = properties.gap.value / 2 - timer_increment;
    let x_next = all_dims.Width + properties.gap.value;
    let y = 0;
    let text_is_scrolled = (all_dims.Width > window.Width);
    let width = get_width();
    let flags = get_flags();

    gr.FillSolidRect(0, 0, window.Width, window.Height, properties.color_background.value);
    if (text_is_scrolled) {
        draw_text(left_tags, properties.color_left.value, x_first);
        draw_text(left_tags, properties.color_left.value, x_first + x_next);
        draw_text(right_tags, properties.color_right.value, x_first + left_dims.Width);
        draw_text(right_tags, properties.color_right.value, x_first + left_dims.Width + x_next);
        if (timer_running == false) {
            interval_id = setInterval(() => {draw_it()}, properties.scroll_delay.value);
            timer_running = true;
        }
    } else {
        draw_text(left_tags, properties.color_left.value, -right_dims.Width / 2);
        draw_text(right_tags, properties.color_right.value, left_dims.Width / 2);
    }

    function calc_text(str, font, use_exact=false) {
        // Get text width and height with output like gr.MeasureString
        let w = gr.CalcTextWidth(str, font, use_exact);
        let h = gr.CalcTextHeight(str, font);
        return {Width: w, Height: h};
    }

    function draw_it() {
        timer_increment = timer_increment % x_next;
        timer_increment += 1;
        window.Repaint();
    }

    function draw_text(tags, color, x) {
        gr.GdiDrawText(tags, font, color, x, y, width, window.Height, flags);
    }

    function get_flags() {
        // Get GdiDrawText flags if scrolling or static.
        let common = DT_VCENTER | DT_CALCRECT | DT_NOPREFIX;
        if (text_is_scrolled) {
            return DT_LEFT | common;
        } else {
            return DT_CENTER | common;
        }
    }

    function get_font(font_size, full_text) {
        // in case the window HEIGHT is too small, decrease font size
        // till a minimum is reached
        let font = gdi.Font(properties.font.value, font_size, 0);
        let temp = calc_text(full_text, font, true);
        while (font_size > properties.font_size_min.value && (
               window.Height * .99 < temp.Height)) {
            font_size--;
            font = gdi.Font(properties.font.value, font_size, 0);
            temp = calc_text(full_text, font);
        }
        return font;
    }

    function get_width() {
        if (text_is_scrolled) {
            return all_dims.Width;
        } else {
            return window.Width;
        }
    }
}


function on_playback_edited(handle) {
    reset_timer();
    window.Repaint();
}


function on_playback_new_track() {
    reset_timer();
    window.Repaint();
}


function on_size() {
    reset_timer();
}



function on_selection_changed() {
    if (fb.IsPlaying == false && fb.IsPaused == false) {
        reset_timer();
        window.Repaint()
    }
}


function reset_timer() {
    // reset moving text Interval on track-change
    if (timer_running == true){
        clearInterval(interval_id)
        timer_increment = 0
        timer_running = false
    }
}


function update_colours() {
    if (window.InstanceType == 1) {
        colours.text = window.GetColourDUI(ColourTypeDUI.text);
        colours.highlight = window.GetColourDUI(ColourTypeDUI.highlight);
        colours.background = window.GetColourDUI(ColourTypeDUI.background);
    } else {
        colours.text = window.GetColourCUI(ColourTypeCUI.text);  //, item_props_guid);
        colours.highlight = window.GetColourCUI(ColourTypeCUI.text);  //, item_props_guid);
        colours.background = window.GetColourCUI(ColourTypeCUI.background);  //, item_props_guid);
    }
}
