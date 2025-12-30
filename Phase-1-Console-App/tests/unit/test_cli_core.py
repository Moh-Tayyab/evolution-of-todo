import pytest
from unittest.mock import patch, MagicMock
from src.cli.main import main, handle_search_filter
from src.cli.menu import display_menu, get_menu_choice

def test_display_menu():
    with patch('src.cli.menu.console.print') as mock_print:
        display_menu()
        assert mock_print.called

def test_get_menu_choice():
    # IntPrompt.ask returns an int
    with patch('src.cli.menu.IntPrompt.ask', return_value=5) as mock_ask:
        assert get_menu_choice() == 5
        mock_ask.assert_called_once()

def test_handle_search_filter_search():
    task_list = MagicMock()
    with patch('src.cli.main.Prompt.ask', return_value='1'):
        with patch('src.cli.main.handle_search') as mock_search:
            handle_search_filter(task_list)
            mock_search.assert_called_once_with(task_list)

def test_handle_search_filter_filter():
    task_list = MagicMock()
    with patch('src.cli.main.Prompt.ask', return_value='2'):
        with patch('src.cli.main.handle_filter') as mock_filter:
            handle_search_filter(task_list)
            mock_filter.assert_called_once_with(task_list)

def test_main_loop_exit():
    # Use side_effect to return 9 once, then sys.exit(0) will be called.
    with patch('src.cli.main.get_menu_choice', side_effect=[9]):
        with patch('src.cli.main.TaskList'):
            with patch('src.cli.main.NotificationService') as mock_ns:
                with patch('sys.exit', side_effect=SystemExit) as mock_exit:
                    with patch('src.cli.main.console.print') as mock_print: # Mock print in main
                        with pytest.raises(SystemExit):
                            main()
                        mock_exit.assert_called_once_with(0)
                        mock_ns.return_value.start.assert_called_once()
                        mock_print.assert_called()
